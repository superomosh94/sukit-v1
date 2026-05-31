import { useMemo } from 'react';

const SNAP_TOLERANCE = 5;

export function useSnapToElements(componentId, allComponents, currentPosition) {
    return useMemo(() => {
        if (!currentPosition || !componentId) {
            return { snapOffset: { x: 0, y: 0 }, snapLines: [] };
        }

        const current = allComponents.find(c => c.id === componentId);
        if (!current) return { snapOffset: { x: 0, y: 0 }, snapLines: [] };

        const snapLines = [];
        let offsetX = 0;
        let offsetY = 0;

        const curPos = currentPosition;
        const curSize = current.size || { width: 100, height: 50 };
        const curLeft = curPos.x;
        const curRight = curPos.x + curSize.width;
        const curTop = curPos.y;
        const curBottom = curPos.y + curSize.height;
        const curCenterX = curPos.x + curSize.width / 2;
        const curCenterY = curPos.y + curSize.height / 2;

        for (const other of allComponents) {
            if (other.id === componentId) return;

            const oPos = other.position || { x: 0, y: 0 };
            const oSize = other.size || { width: 100, height: 50 };
            const oLeft = oPos.x;
            const oRight = oPos.x + oSize.width;
            const oTop = oPos.y;
            const oBottom = oPos.y + oSize.height;
            const oCenterX = oPos.x + oSize.width / 2;
            const oCenterY = oPos.y + oSize.height / 2;

            // Horizontal snaps
            if (Math.abs(curLeft - oLeft) < SNAP_TOLERANCE) {
                offsetX = oLeft - curLeft;
                snapLines.push({ orientation: 'vertical', position: oLeft });
            } else if (Math.abs(curRight - oRight) < SNAP_TOLERANCE) {
                offsetX = oRight - curRight;
                snapLines.push({ orientation: 'vertical', position: oRight });
            } else if (Math.abs(curCenterX - oCenterX) < SNAP_TOLERANCE) {
                offsetX = oCenterX - curCenterX;
                snapLines.push({ orientation: 'vertical', position: oCenterX });
            } else if (Math.abs(curLeft - oRight) < SNAP_TOLERANCE) {
                offsetX = oRight - curLeft;
                snapLines.push({ orientation: 'vertical', position: oRight });
            } else if (Math.abs(curRight - oLeft) < SNAP_TOLERANCE) {
                offsetX = oLeft - curRight;
                snapLines.push({ orientation: 'vertical', position: oLeft });
            }

            // Vertical snaps
            if (Math.abs(curTop - oTop) < SNAP_TOLERANCE) {
                offsetY = oTop - curTop;
                snapLines.push({ orientation: 'horizontal', position: oTop });
            } else if (Math.abs(curBottom - oBottom) < SNAP_TOLERANCE) {
                offsetY = oBottom - curBottom;
                snapLines.push({ orientation: 'horizontal', position: oBottom });
            } else if (Math.abs(curCenterY - oCenterY) < SNAP_TOLERANCE) {
                offsetY = oCenterY - curCenterY;
                snapLines.push({ orientation: 'horizontal', position: oCenterY });
            } else if (Math.abs(curTop - oBottom) < SNAP_TOLERANCE) {
                offsetY = oBottom - curTop;
                snapLines.push({ orientation: 'horizontal', position: oBottom });
            } else if (Math.abs(curBottom - oTop) < SNAP_TOLERANCE) {
                offsetY = oTop - curBottom;
                snapLines.push({ orientation: 'horizontal', position: oTop });
            }
        }

        return { snapOffset: { x: offsetX, y: offsetY }, snapLines };
    }, [componentId, allComponents, currentPosition]);
}

export default useSnapToElements;
