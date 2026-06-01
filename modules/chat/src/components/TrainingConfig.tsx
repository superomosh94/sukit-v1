'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Trash2, BookOpen, Plus } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { cn } from '../utils/cn';

interface TrainingConfigProps {
  className?: string;
}

export function TrainingConfig({ className }: TrainingConfigProps) {
  const trainingDocuments = useChatStore((s) => s.trainingDocuments);
  const faqEntries = useChatStore((s) => s.faqEntries);
  const addTrainingDocument = useChatStore((s) => s.addTrainingDocument);
  const removeTrainingDocument = useChatStore((s) => s.removeTrainingDocument);
  const addFaqEntry = useChatStore((s) => s.addFaqEntry);
  const removeFaqEntry = useChatStore((s) => s.removeFaqEntry);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch('/api/chat/training/documents', {
          method: 'POST',
          body: formData,
        });
        const doc = await res.json();
        addTrainingDocument(doc);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddFaq = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    addFaqEntry({
      id: `faq-${Date.now()}`,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      category: 'general',
    });
    setNewQuestion('');
    setNewAnswer('');
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Upload className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Training Documents</h3>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
          >
            <Upload className="size-3" />
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.doc,.docx,.md,.csv"
            onChange={handleUpload}
            className="hidden"
          />
        </div>
        {trainingDocuments.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No training documents uploaded yet
          </p>
        ) : (
          <div className="space-y-2">
            {trainingDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />
                  <span className="font-medium">{doc.filename}</span>
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-[10px]',
                      doc.status === 'indexed' &&
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                      doc.status === 'processing' &&
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                      doc.status === 'failed' &&
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                      doc.status === 'pending' &&
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    )}
                  >
                    {doc.status}
                  </span>
                  <span className="text-muted-foreground">
                    {doc.chunks} chunks
                  </span>
                </div>
                <button
                  onClick={() => removeTrainingDocument(doc.id)}
                  className="rounded p-1 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">FAQ Import</h3>
        </div>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Question..."
              className="h-8 flex-1 rounded-md border bg-background px-3 text-xs"
            />
            <input
              type="text"
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Answer..."
              className="h-8 flex-1 rounded-md border bg-background px-3 text-xs"
            />
            <button
              onClick={handleAddFaq}
              className="flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground"
            >
              <Plus className="size-3" /> Add
            </button>
          </div>
          {faqEntries.length > 0 && (
            <div className="max-h-60 space-y-1 overflow-y-auto">
              {faqEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-2 rounded-md bg-muted p-2 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{entry.question}</p>
                    <p className="text-muted-foreground line-clamp-2">
                      {entry.answer}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFaqEntry(entry.id)}
                    className="rounded p-1 shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
