'use client';

import { useState } from 'react';
import { Plus, Trash2, Code } from 'lucide-react';
import { useSeoStore, type SchemaMarkup } from '../stores/seoStore';
import { cn } from '../utils/cn';

const SCHEMA_TYPES = [
  {
    value: 'Article',
    label: 'Article',
    fields: [
      'headline',
      'datePublished',
      'dateModified',
      'author',
      'image',
      'description',
    ],
  },
  {
    value: 'Product',
    label: 'Product',
    fields: [
      'name',
      'description',
      'image',
      'sku',
      'brand',
      'offers.price',
      'offers.availability',
    ],
  },
  {
    value: 'LocalBusiness',
    label: 'Local Business',
    fields: [
      'name',
      'description',
      'image',
      'address.streetAddress',
      'address.addressLocality',
      'telephone',
      'openingHours',
    ],
  },
  {
    value: 'FAQPage',
    label: 'FAQ',
    fields: ['mainEntity[0].questionName', 'mainEntity[0].acceptedAnswerText'],
  },
  {
    value: 'Review',
    label: 'Review',
    fields: [
      'itemReviewed',
      'reviewRating.ratingValue',
      'author',
      'reviewBody',
    ],
  },
  {
    value: 'Event',
    label: 'Event',
    fields: [
      'name',
      'description',
      'startDate',
      'endDate',
      'location.name',
      'offers.url',
    ],
  },
  {
    value: 'Organization',
    label: 'Organization',
    fields: ['name', 'url', 'logo', 'contactPoint.telephone', 'sameAs'],
  },
  {
    value: 'Person',
    label: 'Person',
    fields: ['name', 'givenName', 'familyName', 'jobTitle', 'image', 'url'],
  },
  {
    value: 'BreadcrumbList',
    label: 'BreadcrumbList',
    fields: ['itemListElement[0].name', 'itemListElement[0].item'],
  },
];

interface SchemaEditorProps {
  className?: string;
}

export function SchemaEditor({ className }: SchemaEditorProps) {
  const schemas = useSeoStore((s) => s.schemas);
  const addSchema = useSeoStore((s) => s.addSchema);
  const removeSchema = useSeoStore((s) => s.removeSchema);
  const updateSchema = useSeoStore((s) => s.updateSchema);
  const [showJson, setShowJson] = useState<string | null>(null);

  return (
    <div className={cn('space-y-4 rounded-lg border bg-card p-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Schema Markup</h3>
        </div>
        <select
          onChange={(e) =>
            e.target.value && (addSchema(e.target.value), (e.target.value = ''))
          }
          className="h-7 rounded border bg-background px-2 text-xs"
          value=""
        >
          <option value="" disabled>
            Add schema...
          </option>
          {SCHEMA_TYPES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {schemas.length === 0 ? (
        <p className="text-xs text-muted-foreground">No schema markup added</p>
      ) : (
        <div className="space-y-3">
          {schemas.map((schema) => {
            const schemaDef = SCHEMA_TYPES.find((s) => s.value === schema.type);
            return (
              <div
                key={schema.id}
                className="rounded-md border bg-background p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">{schema.type}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setShowJson(showJson === schema.id ? null : schema.id)
                      }
                      className="rounded p-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      View JSON
                    </button>
                    <button
                      onClick={() => removeSchema(schema.id)}
                      className="rounded p-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {(schemaDef?.fields ?? []).map((field) => (
                    <SchemaFieldInput
                      key={field}
                      field={field}
                      value={getNestedValue(schema.data, field)}
                      onChange={(value) => {
                        const data = { ...schema.data };
                        setNestedValue(data, field, value);
                        updateSchema(schema.id, { data });
                      }}
                    />
                  ))}
                  <SchemaDynamicFields
                    schema={schema}
                    updateSchema={updateSchema}
                  />
                </div>
                {showJson === schema.id && (
                  <pre className="mt-2 max-h-40 overflow-auto rounded bg-muted p-2 text-[10px]">
                    {JSON.stringify(generateSchemaJson(schema), null, 2)}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SchemaFieldInput({
  field,
  value,
  onChange,
}: {
  field: string;
  value: any;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-40 text-muted-foreground truncate">{field}</span>
      <input
        type="text"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 flex-1 rounded border bg-background px-2 text-xs"
        placeholder={`Enter ${field.split('.').pop()}...`}
      />
    </div>
  );
}

function SchemaDynamicFields({
  schema,
  updateSchema,
}: {
  schema: SchemaMarkup;
  updateSchema: (id: string, data: Partial<SchemaMarkup>) => void;
}) {
  if (schema.type === 'FAQPage') {
    const questions = (schema.data as any).mainEntity ?? [];
    return (
      <div className="mt-2 space-y-2">
        {questions.map((q: any, i: number) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={q.questionName ?? ''}
              onChange={(e) => {
                const data = { ...schema.data, mainEntity: [...questions] };
                data.mainEntity[i] = {
                  ...data.mainEntity[i],
                  questionName: e.target.value,
                };
                updateSchema(schema.id, { data });
              }}
              placeholder="Question"
              className="h-7 flex-1 rounded border bg-background px-2 text-xs"
            />
            <input
              type="text"
              value={q.acceptedAnswerText ?? ''}
              onChange={(e) => {
                const data = { ...schema.data, mainEntity: [...questions] };
                data.mainEntity[i] = {
                  ...data.mainEntity[i],
                  acceptedAnswerText: e.target.value,
                };
                updateSchema(schema.id, { data });
              }}
              placeholder="Answer"
              className="h-7 flex-1 rounded border bg-background px-2 text-xs"
            />
          </div>
        ))}
        <button
          onClick={() => {
            const data = {
              ...schema.data,
              mainEntity: [
                ...questions,
                { questionName: '', acceptedAnswerText: '' },
              ],
            };
            updateSchema(schema.id, { data });
          }}
          className="text-xs text-primary hover:underline"
        >
          + Add Question
        </button>
      </div>
    );
  }
  if (schema.type === 'BreadcrumbList') {
    const items = (schema.data as any).itemListElement ?? [];
    return (
      <div className="mt-2 space-y-2">
        {items.map((item: any, i: number) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={item.name ?? ''}
              onChange={(e) => {
                const data = { ...schema.data, itemListElement: [...items] };
                data.itemListElement[i] = {
                  ...data.itemListElement[i],
                  name: e.target.value,
                };
                updateSchema(schema.id, { data });
              }}
              placeholder="Breadcrumb name"
              className="h-7 flex-1 rounded border bg-background px-2 text-xs"
            />
            <input
              type="text"
              value={item.item ?? ''}
              onChange={(e) => {
                const data = { ...schema.data, itemListElement: [...items] };
                data.itemListElement[i] = {
                  ...data.itemListElement[i],
                  item: e.target.value,
                };
                updateSchema(schema.id, { data });
              }}
              placeholder="URL"
              className="h-7 flex-1 rounded border bg-background px-2 text-xs"
            />
          </div>
        ))}
        <button
          onClick={() => {
            const data = {
              ...schema.data,
              itemListElement: [...items, { name: '', item: '' }],
            };
            updateSchema(schema.id, { data });
          }}
          className="text-xs text-primary hover:underline"
        >
          + Add Item
        </button>
      </div>
    );
  }
  return null;
}

function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((acc, part) => {
    const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, key, index] = arrayMatch;
      return acc?.[key]?.[Number(index)] ?? '';
    }
    return acc?.[part] ?? '';
  }, obj);
}

function setNestedValue(obj: any, path: string, value: string) {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, key, index] = arrayMatch;
      if (!current[key]) current[key] = [];
      if (!current[key][Number(index)]) current[key][Number(index)] = {};
      current = current[key][Number(index)];
    } else {
      if (!current[part]) current[part] = {};
      current = current[part];
    }
  }
  const lastPart = parts[parts.length - 1];
  const arrayMatch = lastPart.match(/^(\w+)\[(\d+)\]$/);
  if (arrayMatch) {
    const [, key, index] = arrayMatch;
    if (!current[key]) current[key] = [];
    current[key][Number(index)] = value;
  } else {
    current[lastPart] = value;
  }
}

function generateSchemaJson(schema: SchemaMarkup): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': schema.type,
    ...schema.data,
  };
}
