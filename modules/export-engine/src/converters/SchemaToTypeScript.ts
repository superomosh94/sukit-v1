export interface JSONSchema {
  type?: string;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  [key: string]: unknown;
}

export interface JSONSchemaProperty {
  type: string;
  description?: string;
  default?: unknown;
  enum?: string[];
  items?: JSONSchemaProperty;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
}

export class SchemaToTypeScriptConverter {
  convertSchemaToInterface(schema: JSONSchema, componentName: string): string {
    const props = schema.properties || {};
    const lines: string[] = [];
    lines.push(`export interface ${componentName}Props {`);

    for (const [key, prop] of Object.entries(props)) {
      const optional = !schema.required?.includes(key) ? '?' : '';
      const tsType = this.toTypeScriptType(prop);
      const desc = prop.description ? ` // ${prop.description}` : '';
      lines.push(`  ${key}${optional}: ${tsType};${desc}`);
    }

    lines.push('}');
    return lines.join('\n');
  }

  convertSchemaToPropsType(schema: JSONSchema): string {
    const { properties = {} } = schema;
    const entries = Object.entries(properties).map(([key, prop]) => {
      const tsType = this.toTypeScriptType(prop);
      return `  ${key}: ${tsType}`;
    });
    return `{\n${entries.join(';\n')};\n}`;
  }

  convertDefaultValuesToProps(schema: JSONSchema): string {
    const { properties = {} } = schema;
    const defaults: Record<string, unknown> = {};
    for (const [key, prop] of Object.entries(properties)) {
      if (prop.default !== undefined) {
        defaults[key] = prop.default;
      }
    }

    if (Object.keys(defaults).length === 0) return '{}';
    return JSON.stringify(defaults, null, 2);
  }

  generateValidationSchema(schema: JSONSchema): string {
    const { properties = {}, required = [] } = schema;
    const rules: string[] = [];

    for (const key of required) {
      rules.push(
        `  ${key}: z.any().refine((v) => v !== undefined && v !== null, '${key} is required')`
      );
    }

    for (const [key, prop] of Object.entries(properties)) {
      if (required.includes(key)) continue;
      const tsType = this.toTypeScriptType(prop);
      let zodType = 'z.any()';
      if (tsType === 'string') zodType = 'z.string().optional()';
      else if (tsType === 'number') zodType = 'z.number().optional()';
      else if (tsType === 'boolean') zodType = 'z.boolean().optional()';
      else if (tsType.startsWith('string[]'))
        zodType = 'z.array(z.string()).optional()';

      if (!rules.some((r) => r.includes(key))) {
        rules.push(`  ${key}: ${zodType}`);
      }
    }

    return `import { z } from 'zod';\n\nexport const ${this.schemaName}_Schema = z.object({\n${rules.join(',\n')}\n});`;
  }

  private toTypeScriptType(prop: JSONSchemaProperty): string {
    const typeMap: Record<string, string> = {
      string: 'string',
      number: 'number',
      integer: 'number',
      boolean: 'boolean',
      object: 'Record<string, unknown>',
      array: this.arrayType(prop),
    };

    if (prop.enum) {
      return prop.enum.map((v) => `'${v}'`).join(' | ');
    }

    return typeMap[prop.type] || 'unknown';
  }

  private arrayType(prop: JSONSchemaProperty): string {
    if (prop.items) {
      const itemType = this.toTypeScriptType(prop.items);
      return `${itemType}[]`;
    }
    return 'unknown[]';
  }

  private get schemaName(): string {
    return 'GeneratedSchema';
  }
}

export const schemaConverter = new SchemaToTypeScriptConverter();
