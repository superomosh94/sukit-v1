import type { SukitKernel } from '@sukit/core';
import type {
  SubmissionStep,
  SubmissionDraft,
  ValidationReport,
  ValidationCheck,
  SecurityScanResult,
  SecurityFinding,
  SubmissionReviewData,
  MarketplaceModuleData,
  ModuleStatus,
} from './types';

export class ModuleSubmission {
  private kernel: SukitKernel;
  private draftStorageKey = 'marketplace:submission-draft';

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
  }

  // ─── Submission States (Category 8.1) ──────────────────────────

  async getCurrentStatus(moduleId: string): Promise<{
    status: ModuleStatus;
    currentStep: SubmissionStep | null;
    rejectionReason: string | null;
    review: SubmissionReviewData | null;
  }> {
    const res = await fetch(
      `/api/developer/modules/${moduleId}/submission-status`
    );
    return res.json();
  }

  async submitForReview(moduleId: string): Promise<{
    success: boolean;
    message: string;
    reviewId?: string;
  }> {
    const validation = await this.runFullValidation(moduleId);
    if (!validation.passed) {
      return {
        success: false,
        message: `Validation failed: ${validation.checks
          .filter((c) => c.status === 'fail')
          .map((c) => c.label)
          .join(', ')}`,
      };
    }

    const security = await this.runSecurityScan(moduleId);
    if (!security.passed) {
      const critical = security.findings.filter(
        (f) => f.severity === 'critical'
      );
      if (critical.length > 0) {
        return {
          success: false,
          message: `Security scan failed: ${critical.length} critical issue(s) found`,
        };
      }
    }

    const res = await fetch(`/api/developer/modules/${moduleId}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        validationReport: validation,
        securityScan: security,
      }),
    });
    const data = await res.json();

    if (res.ok) {
      await this.clearDraft();
      await this.kernel.events.emit('marketplace:modulePublished', {
        moduleId,
        authorId: data.authorId,
      });
    }

    return data;
  }

  async requestChanges(moduleId: string): Promise<void> {
    const res = await fetch(
      `/api/developer/modules/${moduleId}/request-changes`,
      { method: 'POST' }
    );
    return res.json();
  }

  async resubmit(
    moduleId: string
  ): Promise<{ success: boolean; message: string }> {
    return this.submitForReview(moduleId);
  }

  async deprecateModule(moduleId: string, reason?: string): Promise<void> {
    await fetch(`/api/developer/modules/${moduleId}/deprecate`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // ─── Submission Workflow Steps (Category 8.2) ──────────────────

  async saveDraft(draft: SubmissionDraft): Promise<void> {
    const existing = await this.loadDraft();
    const merged = { ...existing, ...draft, currentStep: draft.currentStep };
    await this.kernel.settings.set(
      this.draftStorageKey,
      JSON.stringify(merged)
    );
  }

  async loadDraft(): Promise<SubmissionDraft | null> {
    const raw = await this.kernel.settings.get(this.draftStorageKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw as string);
    } catch {
      return null;
    }
  }

  async clearDraft(): Promise<void> {
    await this.kernel.settings.set(this.draftStorageKey, '');
  }

  async getDraftProgress(): Promise<{
    step: SubmissionStep;
    completedSteps: SubmissionStep[];
    totalSteps: number;
    percentComplete: number;
  }> {
    const draft = await this.loadDraft();
    const allSteps: SubmissionStep[] = [
      'basic-info',
      'pricing',
      'upload',
      'assets',
      'documentation',
      'review',
    ];

    const stepIndex = draft?.currentStep
      ? allSteps.indexOf(draft.currentStep)
      : 0;

    return {
      step: draft?.currentStep || 'basic-info',
      completedSteps: allSteps.slice(0, Math.max(0, stepIndex)),
      totalSteps: allSteps.length,
      percentComplete: Math.round((stepIndex / allSteps.length) * 100),
    };
  }

  async submitBasicInfo(data: {
    name: string;
    description: string;
    category: string;
    tags: string[];
  }): Promise<void> {
    const draft = (await this.loadDraft()) || { currentStep: 'basic-info' };
    draft.basicInfo = data;
    draft.currentStep = 'pricing';
    await this.saveDraft(draft);
  }

  async submitPricing(data: {
    priceModel: string;
    price?: number;
    subscriptionMonthly?: number;
    subscriptionYearly?: number;
  }): Promise<void> {
    const draft = await this.loadDraft();
    if (!draft) throw new Error('No draft found. Start with basic info first.');
    draft.pricing = data;
    draft.currentStep = 'upload';
    await this.saveDraft(draft);
  }

  async submitUpload(data: {
    fileUrl: string;
    fileSize: number;
    version: string;
    sukVersion: string;
  }): Promise<void> {
    const draft = await this.loadDraft();
    if (!draft) throw new Error('No draft found');
    draft.upload = data;
    draft.currentStep = 'assets';
    await this.saveDraft(draft);
  }

  async submitAssets(data: {
    screenshots: string[];
    icon?: string;
    banner?: string;
    demoUrl?: string;
    supportUrl?: string;
    sourceUrl?: string;
  }): Promise<void> {
    const draft = await this.loadDraft();
    if (!draft) throw new Error('No draft found');
    draft.assets = data;
    draft.currentStep = 'documentation';
    await this.saveDraft(draft);
  }

  async submitDocumentation(data: {
    readme: string;
    changelog?: string;
  }): Promise<void> {
    const draft = await this.loadDraft();
    if (!draft) throw new Error('No draft found');
    draft.documentation = data;
    draft.currentStep = 'review';
    await this.saveDraft(draft);
  }

  // ─── Automated Validation (Category 8.3 / 7.5) ─────────────────

  async runFullValidation(moduleId: string): Promise<ValidationReport> {
    const checks: ValidationCheck[] = [
      await this.checkManifest(moduleId),
      await this.checkPermissions(moduleId),
      await this.checkDependencies(moduleId),
      await this.checkMaliciousCode(moduleId),
      await this.checkRemoteCodeExecution(moduleId),
      await this.checkNetworkCalls(moduleId),
      await this.checkFileSize(moduleId),
      await this.checkCompatibility(moduleId),
    ];

    const failed = checks.filter((c) => c.status === 'fail');

    return {
      passed: failed.length === 0,
      checks,
      summary:
        failed.length > 0
          ? `${failed.length} validation check(s) failed: ${failed.map((c) => c.label).join(', ')}`
          : 'All validation checks passed',
      generatedAt: new Date().toISOString(),
    };
  }

  private async checkManifest(moduleId: string): Promise<ValidationCheck> {
    try {
      const res = await fetch(
        `/api/developer/modules/${moduleId}/validate/manifest`
      );
      const data = await res.json();
      return {
        name: 'manifest-validation',
        label: 'Manifest Validation',
        status: data.valid ? 'pass' : 'fail',
        message: data.valid
          ? 'manifest.json is valid'
          : data.error || 'Invalid manifest',
      };
    } catch (e: any) {
      return {
        name: 'manifest-validation',
        label: 'Manifest Validation',
        status: 'fail',
        message: e.message,
      };
    }
  }

  private async checkPermissions(moduleId: string): Promise<ValidationCheck> {
    try {
      const res = await fetch(
        `/api/developer/modules/${moduleId}/validate/permissions`
      );
      const data = await res.json();
      return {
        name: 'permission-validation',
        label: 'Permission Validation',
        status: data.valid ? 'pass' : 'fail',
        message: data.valid
          ? 'All permissions are valid'
          : data.error || 'Invalid permissions',
      };
    } catch (e: any) {
      return {
        name: 'permission-validation',
        label: 'Permission Validation',
        status: 'fail',
        message: e.message,
      };
    }
  }

  private async checkDependencies(moduleId: string): Promise<ValidationCheck> {
    try {
      const res = await fetch(
        `/api/developer/modules/${moduleId}/validate/dependencies`
      );
      const data = await res.json();
      return {
        name: 'dependency-validation',
        label: 'Dependency Validation',
        status: data.valid ? 'pass' : 'fail',
        message: data.valid
          ? 'All dependencies exist and are valid'
          : data.error || 'Invalid dependencies',
      };
    } catch (e: any) {
      return {
        name: 'dependency-validation',
        label: 'Dependency Validation',
        status: 'fail',
        message: e.message,
      };
    }
  }

  private async checkMaliciousCode(moduleId: string): Promise<ValidationCheck> {
    try {
      const res = await fetch(
        `/api/developer/modules/${moduleId}/validate/security/malicious`
      );
      const data = await res.json();
      return {
        name: 'malicious-code-check',
        label: 'Malicious Code Scan',
        status: data.clean ? 'pass' : 'fail',
        message: data.clean
          ? 'No malicious code detected'
          : data.findings?.join(', ') || 'Suspicious code found',
        details: data.details,
      };
    } catch (e: any) {
      return {
        name: 'malicious-code-check',
        label: 'Malicious Code Scan',
        status: 'warn',
        message: `Scan failed: ${e.message}`,
      };
    }
  }

  private async checkRemoteCodeExecution(
    moduleId: string
  ): Promise<ValidationCheck> {
    try {
      const res = await fetch(
        `/api/developer/modules/${moduleId}/validate/security/rce`
      );
      const data = await res.json();
      return {
        name: 'rce-check',
        label: 'Remote Code Execution Check',
        status: data.clean ? 'pass' : 'fail',
        message: data.clean
          ? 'No eval/exec usage detected'
          : data.findings?.join(', ') || 'Suspicious eval/exec usage found',
      };
    } catch (e: any) {
      return {
        name: 'rce-check',
        label: 'Remote Code Execution Check',
        status: 'warn',
        message: `Scan failed: ${e.message}`,
      };
    }
  }

  private async checkNetworkCalls(moduleId: string): Promise<ValidationCheck> {
    try {
      const res = await fetch(
        `/api/developer/modules/${moduleId}/validate/security/network`
      );
      const data = await res.json();
      return {
        name: 'network-call-check',
        label: 'Network Call Validation',
        status: data.clean ? 'pass' : 'warn',
        message: data.clean
          ? 'No unexpected network calls'
          : data.details || 'External network calls detected',
      };
    } catch (e: any) {
      return {
        name: 'network-call-check',
        label: 'Network Call Validation',
        status: 'warn',
        message: `Scan failed: ${e.message}`,
      };
    }
  }

  private async checkFileSize(moduleId: string): Promise<ValidationCheck> {
    try {
      const res = await fetch(
        `/api/developer/modules/${moduleId}/validate/filesize`
      );
      const data = await res.json();
      return {
        name: 'file-size-check',
        label: 'File Size Check',
        status: data.valid ? 'pass' : 'fail',
        message: data.valid
          ? `Size: ${data.formattedSize} (under 10MB limit)`
          : `File too large: ${data.formattedSize} (max 10MB)`,
      };
    } catch (e: any) {
      return {
        name: 'file-size-check',
        label: 'File Size Check',
        status: 'warn',
        message: `Check failed: ${e.message}`,
      };
    }
  }

  private async checkCompatibility(moduleId: string): Promise<ValidationCheck> {
    try {
      const res = await fetch(
        `/api/developer/modules/${moduleId}/validate/compatibility`
      );
      const data = await res.json();
      return {
        name: 'compatibility-check',
        label: 'SUKIT Compatibility Check',
        status: data.valid ? 'pass' : 'fail',
        message: data.valid
          ? `Compatible with SUKIT ${data.version}`
          : data.error || 'Incompatible with current SUKIT version',
      };
    } catch (e: any) {
      return {
        name: 'compatibility-check',
        label: 'SUKIT Compatibility Check',
        status: 'warn',
        message: `Check failed: ${e.message}`,
      };
    }
  }

  // ─── Security Scan (Category 8.3) ──────────────────────────────

  async runSecurityScan(moduleId: string): Promise<SecurityScanResult> {
    const findings: SecurityFinding[] = [
      ...(await this.scanForSecrets(moduleId)),
      ...(await this.scanForObfuscation(moduleId)),
      ...(await this.scanForMalware(moduleId)),
      ...(await this.scanDependencies(moduleId)),
    ];

    const criticalCount = findings.filter(
      (f) => f.severity === 'critical'
    ).length;
    const highCount = findings.filter((f) => f.severity === 'high').length;
    const score = Math.max(
      0,
      100 - (criticalCount * 30 + highCount * 10 + findings.length * 2)
    );

    return {
      passed: criticalCount === 0 && highCount <= 3,
      score,
      findings,
      scannedAt: new Date().toISOString(),
    };
  }

  private async scanForSecrets(moduleId: string): Promise<SecurityFinding[]> {
    try {
      const res = await fetch(
        `/api/developer/modules/${moduleId}/scan/secrets`
      );
      return res.json();
    } catch {
      return [];
    }
  }

  private async scanForObfuscation(
    moduleId: string
  ): Promise<SecurityFinding[]> {
    try {
      const res = await fetch(
        `/api/developer/modules/${moduleId}/scan/obfuscation`
      );
      return res.json();
    } catch {
      return [];
    }
  }

  private async scanForMalware(moduleId: string): Promise<SecurityFinding[]> {
    try {
      const res = await fetch(
        `/api/developer/modules/${moduleId}/scan/malware`
      );
      return res.json();
    } catch {
      return [];
    }
  }

  private async scanDependencies(moduleId: string): Promise<SecurityFinding[]> {
    try {
      const res = await fetch(
        `/api/developer/modules/${moduleId}/scan/dependencies`
      );
      return res.json();
    } catch {
      return [];
    }
  }

  // ─── Version Upload (Category 7.4) ─────────────────────────────

  async uploadNewVersion(
    moduleId: string,
    data: {
      file: File;
      version: string;
      changelog?: string;
      sukVersion?: string;
      isBeta?: boolean;
    }
  ): Promise<{
    success: boolean;
    version?: string;
    errors?: string[];
  }> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('version', data.version);
    if (data.changelog) formData.append('changelog', data.changelog);
    if (data.sukVersion) formData.append('sukVersion', data.sukVersion);
    if (data.isBeta) formData.append('isBeta', 'true');

    const res = await fetch(`/api/developer/modules/${moduleId}/version`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  }
}
