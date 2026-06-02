'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Plus, Trash2 } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { cn } from '../utils/cn';
const CRM_OPTIONS = [
    'hubspot',
    'salesforce',
    'zoho',
    'pipedrive',
    'custom-webhook',
];
export function LeadCapture({ className }) {
    const leadCapture = useChatStore((s) => s.leadCapture);
    const setLeadCapture = useChatStore((s) => s.setLeadCapture);
    const addField = () => {
        setLeadCapture({
            formFields: [
                ...leadCapture.formFields,
                { name: '', label: '', required: false, type: 'text' },
            ],
        });
    };
    const removeField = (index) => {
        setLeadCapture({
            formFields: leadCapture.formFields.filter((_, i) => i !== index),
        });
    };
    const updateField = (index, data) => {
        setLeadCapture({
            formFields: leadCapture.formFields.map((f, i) => i === index ? { ...f, ...data } : f),
        });
    };
    return (_jsxs("div", { className: cn('space-y-4 rounded-lg border bg-card p-4', className), children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-sm font-medium", children: "Lead Capture" }), _jsxs("label", { className: "relative inline-flex cursor-pointer items-center", children: [_jsx("input", { type: "checkbox", checked: leadCapture.enabled, onChange: (e) => setLeadCapture({ enabled: e.target.checked }), className: "peer sr-only" }), _jsx("div", { className: "h-5 w-9 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full" })] })] }), leadCapture.enabled && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-medium text-muted-foreground mb-2 block", children: "Form Fields" }), _jsx("div", { className: "space-y-2", children: leadCapture.formFields.map((field, i) => (_jsxs("div", { className: "flex items-center gap-2 rounded-md bg-muted p-2 text-xs", children: [_jsx("input", { type: "text", value: field.name, onChange: (e) => updateField(i, { name: e.target.value }), placeholder: "Field name", className: "h-7 w-28 rounded border bg-background px-2 text-xs" }), _jsx("input", { type: "text", value: field.label, onChange: (e) => updateField(i, { label: e.target.value }), placeholder: "Label", className: "h-7 flex-1 rounded border bg-background px-2 text-xs" }), _jsxs("select", { value: field.type, onChange: (e) => updateField(i, { type: e.target.value }), className: "h-7 rounded border bg-background px-2 text-xs", children: [_jsx("option", { value: "text", children: "Text" }), _jsx("option", { value: "email", children: "Email" }), _jsx("option", { value: "tel", children: "Phone" }), _jsx("option", { value: "textarea", children: "Textarea" })] }), _jsxs("label", { className: "flex items-center gap-1 text-[10px]", children: [_jsx("input", { type: "checkbox", checked: field.required, onChange: (e) => updateField(i, { required: e.target.checked }) }), "Required"] }), _jsx("button", { onClick: () => removeField(i), className: "rounded p-1 text-muted-foreground hover:text-destructive", children: _jsx(Trash2, { className: "size-3" }) })] }, i))) }), _jsxs("button", { onClick: addField, className: "mt-2 flex items-center gap-1 text-xs text-primary hover:underline", children: [_jsx(Plus, { className: "size-3" }), " Add Field"] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-medium text-muted-foreground", children: "CRM Integration" }), _jsxs("select", { value: leadCapture.crmIntegration, onChange: (e) => setLeadCapture({ crmIntegration: e.target.value }), className: "mt-1 h-8 w-full rounded-md border bg-background px-2 text-xs", children: [_jsx("option", { value: "", children: "None" }), CRM_OPTIONS.map((crm) => (_jsx("option", { value: crm, children: crm.charAt(0).toUpperCase() + crm.slice(1) }, crm)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-medium text-muted-foreground", children: "Webhook URL" }), _jsx("input", { type: "url", value: leadCapture.webhookUrl, onChange: (e) => setLeadCapture({ webhookUrl: e.target.value }), placeholder: "https://hooks.example.com/lead", className: "mt-1 h-8 w-full rounded-md border bg-background px-3 text-xs" })] })] }))] }));
}
//# sourceMappingURL=LeadCapture.js.map