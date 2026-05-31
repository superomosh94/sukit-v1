import React, { useState } from 'react';
import { Globe, Lock, Key, ExternalLink, RotateCcw, BarChart3, Rocket, CheckCircle, XCircle, Clock, ChevronDown, Plus, Trash2, Zap, Cloud, Train, ChevronUp } from 'lucide-react';
import Button from '../components/shared/Button';
import Modal from '../components/shared/Modal';
import { Toast } from '../components/shared/Toast';

const PROVIDERS = [
  { id: 'vercel', name: 'Vercel', icon: '▲', color: 'bg-black text-white' },
  { id: 'netlify', name: 'Netlify', icon: <Zap className="w-5 h-5" />, color: 'bg-teal-500 text-white' },
  { id: 'railway', name: 'Railway', icon: <Train className="w-5 h-5" />, color: 'bg-purple-600 text-white' },
  { id: 'aws', name: 'AWS Amplify', icon: <Cloud className="w-5 h-5" />, color: 'bg-orange-500 text-white' },
];

const Deployment = () => {
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [deploying, setDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState('');
  const [deployProgress, setDeployProgress] = useState(0);
  const [toast, setToast] = useState(null);
  const [showEnvModal, setShowEnvModal] = useState(false);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [envVars, setEnvVars] = useState([
    { key: 'NODE_ENV', value: 'production' },
    { key: 'API_URL', value: '' },
  ]);
  const [customDomain, setCustomDomain] = useState('');
  const [sslStatus, setSslStatus] = useState('inactive');
  const [nodeVersion, setNodeVersion] = useState('18.x');
  const [buildCommand, setBuildCommand] = useState('npm run build');
  const [outputDir, setOutputDir] = useState('dist');
  const [deployments, setDeployments] = useState([
    { id: 1, provider: 'vercel', status: 'live', timestamp: '2026-05-26 14:32', branch: 'main', commit: 'a1b2c3d', url: 'https://my-site.vercel.app' },
    { id: 2, provider: 'vercel', status: 'failed', timestamp: '2026-05-25 10:15', branch: 'main', commit: 'e4f5g6h' },
    { id: 3, provider: 'netlify', status: 'live', timestamp: '2026-05-24 08:00', branch: 'staging', commit: 'i7j8k9l', url: 'https://staging-site.netlify.app' },
  ]);
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [deployStats] = useState({
    totalDeploys: 27,
    liveSites: 2,
    avgBuildTime: '1m 24s',
    uptime: '99.97%',
  });

  const startDeploy = () => {
    setDeploying(true);
    setDeployProgress(0);
    const steps = previewEnabled
      ? ['Deploying to preview environment...', 'Running build...', 'Running tests...', 'Deploying to production...', 'Updating CDN...', 'Site is live!']
      : ['Deploying to production...', 'Running build...', 'Updating CDN...', 'Site is live!'];
    steps.forEach((step, i) => {
      setTimeout(() => {
        setDeployStep(step);
        setDeployProgress(Math.round(((i + 1) / steps.length) * 100));
        if (i === steps.length - 1) {
          setTimeout(() => {
            setDeploying(false);
            setDeployProgress(100);
            setToast({ message: `Deployed to ${selectedProvider?.name} successfully!`, type: 'success' });
          }, 500);
        }
      }, (i + 1) * 1500);
    });
  };

  const addEnvVar = () => setEnvVars([...envVars, { key: '', value: '' }]);
  const updateEnvVar = (index, field, value) => {
    const updated = [...envVars];
    updated[index][field] = value;
    setEnvVars(updated);
  };
  const removeEnvVar = (index) => setEnvVars(envVars.filter((_, i) => i !== index));

  const connectDomain = () => {
    setSslStatus('provisioning');
    setTimeout(() => {
      setSslStatus('active');
      setToast({ message: `Domain ${customDomain} connected with SSL`, type: 'success' });
      setShowDomainModal(false);
    }, 2000);
  };

  const rollback = (deploymentId) => {
    setToast({ message: `Rolled back to deployment #${deploymentId}`, type: 'info' });
  };

  return (
    <section className="p-6 space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Deployment</h1>
          <p className="text-text-secondary mt-1">Build, preview, and deploy your sites</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <BarChart3 className="w-4 h-4" />
          {deployStats.liveSites} live · {deployStats.totalDeploys} deploys · {deployStats.uptime} uptime
        </div>
      </header>

      <div className="grid grid-cols-4 gap-4">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedProvider(p)}
            className={`p-4 rounded-lg border text-center transition-all ${
              selectedProvider?.id === p.id
                ? 'border-primary-500 ring-2 ring-primary-500 bg-primary-50'
                : 'border-border bg-surface hover:border-primary-300'
            }`}
          >
            <div className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center ${typeof p.icon === 'string' ? 'text-lg font-bold' : ''} ${p.color}`}>
              {p.icon}
            </div>
            <p className="mt-2 font-medium text-text-primary text-sm">{p.name}</p>
          </button>
        ))}
      </div>

      {selectedProvider && !deploying && (
        <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">Deploy to {selectedProvider.name}</h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input type="checkbox" checked={previewEnabled} onChange={(e) => setPreviewEnabled(e.target.checked)} className="rounded" />
                Preview staging
              </label>
              <Button onClick={startDeploy} variant="primary">
                <Rocket className="w-4 h-4 mr-1" /> Deploy Now
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div>
              <label className="text-xs text-text-secondary block mb-1">Node Version</label>
              <select value={nodeVersion} onChange={(e) => setNodeVersion(e.target.value)} className="w-full px-3 py-2 bg-surface border border-border rounded text-text-primary text-sm">
                <option>16.x</option>
                <option>18.x</option>
                <option>20.x</option>
                <option>22.x</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-text-secondary block mb-1">Build Command</label>
              <input type="text" value={buildCommand} onChange={(e) => setBuildCommand(e.target.value)} className="w-full px-3 py-2 bg-surface border border-border rounded text-text-primary text-sm font-mono" />
            </div>
            <div>
              <label className="text-xs text-text-secondary block mb-1">Output Directory</label>
              <input type="text" value={outputDir} onChange={(e) => setOutputDir(e.target.value)} className="w-full px-3 py-2 bg-surface border border-border rounded text-text-primary text-sm font-mono" />
            </div>
          </div>
        </div>
      )}

      {deploying && (
        <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-primary">Deploying to {selectedProvider?.name}</h2>
          <div className="w-full bg-surface-light rounded-full h-2">
            <div className="bg-primary-500 h-2 rounded-full transition-all duration-500" style={{ width: `${deployProgress}%` }} />
          </div>
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <Clock className="w-4 h-4 animate-spin" />
            {deployStep}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
              <Globe className="w-4 h-4" /> Custom Domain
            </h2>
            <Button onClick={() => setShowDomainModal(true)} variant="secondary" size="sm">
              <Plus className="w-4 h-4 mr-1" /> Add Domain
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {sslStatus === 'active' ? (
              <span className="flex items-center gap-1 text-success-500"><Lock className="w-3 h-3" /> SSL Active</span>
            ) : sslStatus === 'provisioning' ? (
              <span className="flex items-center gap-1 text-warning-500"><Clock className="w-3 h-3" /> Provisioning SSL...</span>
            ) : (
              <span className="flex items-center gap-1 text-text-secondary"><Lock className="w-3 h-3" /> No domain configured</span>
            )}
          </div>
          <p className="text-sm text-text-secondary">Connect a custom domain with automatic SSL certificate provisioning via Let's Encrypt.</p>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
              <Key className="w-4 h-4" /> Environment Variables
            </h2>
            <Button onClick={() => setShowEnvModal(true)} variant="secondary" size="sm">
              <Plus className="w-4 h-4 mr-1" /> Manage
            </Button>
          </div>
          {envVars.filter(e => e.key).slice(0, 3).map((env, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="font-mono text-primary-500">{env.key}</span>
              <span className="text-text-secondary">=</span>
              <span className="font-mono text-text-secondary">{env.value ? '••••••••' : '(empty)'}</span>
            </div>
          ))}
          {envVars.filter(e => e.key).length > 3 && (
            <p className="text-xs text-text-secondary">+{envVars.filter(e => e.key).length - 3} more</p>
          )}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
          <RotateCcw className="w-4 h-4" /> Deployment History
        </h2>
        <div className="space-y-2">
          {deployments.map((dep) => (
            <div key={dep.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-light transition-colors border border-border">
              <div className="flex items-center gap-3">
                {dep.status === 'live' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">{dep.commit}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${dep.status === 'live' ? 'bg-success-500/20 text-success-500' : 'bg-danger-500/20 text-danger-500'}`}>
                      {dep.status}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">{dep.provider} · {dep.branch} · {dep.timestamp}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {dep.url && (
                  <a href={dep.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-500 hover:underline flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> Visit
                  </a>
                )}
                <button onClick={() => rollback(dep.id)} className="text-xs text-text-secondary hover:text-primary-500 transition-colors">Rollback</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={showEnvModal} onClose={() => setShowEnvModal(false)} title="Environment Variables" size="lg">
        <div className="space-y-3">
          {envVars.map((env, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" placeholder="KEY" value={env.key} onChange={(e) => updateEnvVar(i, 'key', e.target.value)} className="flex-1 px-3 py-2 bg-surface border border-border rounded text-text-primary text-sm font-mono" />
              <input type="text" placeholder="value" value={env.value} onChange={(e) => updateEnvVar(i, 'value', e.target.value)} className="flex-1 px-3 py-2 bg-surface border border-border rounded text-text-primary text-sm font-mono" />
              <button onClick={() => removeEnvVar(i)} className="p-2 text-danger-500 hover:bg-danger-500/20 rounded"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          <button onClick={addEnvVar} className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600"><Plus className="w-4 h-4" /> Add Variable</button>
        </div>
      </Modal>

      <Modal isOpen={showDomainModal} onClose={() => setShowDomainModal(false)} title="Connect Custom Domain" size="md">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary block mb-1">Domain Name</label>
            <input type="text" placeholder="example.com" value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} className="w-full px-3 py-2 bg-surface border border-border rounded text-text-primary text-sm" />
          </div>
          <p className="text-xs text-text-secondary">Add a CNAME record pointing <code className="bg-surface-light px-1 rounded">your-domain.com</code> to <code className="bg-surface-light px-1 rounded">cname.vercel-dns.com</code></p>
          <Button onClick={connectDomain} variant="primary" disabled={!customDomain}>Connect Domain</Button>
        </div>
      </Modal>
    </section>
  );
};

export default Deployment;
