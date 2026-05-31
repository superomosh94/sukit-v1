import { useState, useCallback } from 'react';
import { useEditorStore } from '../stores/editorStore';
import api from '../services/api';

export function useBlockPersistence(componentId, blockId, siteId) {
  const updateComponent = useEditorStore((s) => s.updateComponent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const persist = useCallback(
    async (propsUpdate) => {
      if (!componentId) return;
      setSaving(true);
      setError(null);

      updateComponent(componentId, {
        props: { ...(useEditorStore.getState().components.find((c) => c.id === componentId)?.props || {}), ...propsUpdate },
      });

      if (blockId && siteId) {
        try {
          const component = useEditorStore.getState().components.find((c) => c.id === componentId);
          await api.request(`/pages/${blockId}/blocks/${componentId}`, {
            method: 'PUT',
            body: {
              props: component?.props || {},
              styles: component?.styles || {},
              responsive: component?.responsive || {},
              animation: component?.animation || {},
            },
          });
        } catch (err) {
          setError(err.message);
        }
      }

      setSaving(false);
    },
    [componentId, blockId, siteId, updateComponent],
  );

  const saveStyle = useCallback(
    (styleKey, value) => persist({ styles: { ...getCurrentStyles(), [styleKey]: value } }),
    [persist],
  );

  const saveEvents = useCallback(
    (events) => persist({ events }),
    [persist],
  );

  const saveConditions = useCallback(
    (conditions) => persist({ conditions }),
    [persist],
  );

  const saveDynamic = useCallback(
    (dynamicSource) => persist({ dynamicSource }),
    [persist],
  );

  const saveAdvanced = useCallback(
    (advanced) => persist({ advanced }),
    [persist],
  );

  function getCurrentStyles() {
    const component = useEditorStore.getState().components.find((c) => c.id === componentId);
    return component?.props?.styles || {};
  }

  return {
    saveStyle,
    saveEvents,
    saveConditions,
    saveDynamic,
    saveAdvanced,
    saving,
    error,
  };
}
