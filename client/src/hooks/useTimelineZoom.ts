import { useRef, useState } from "react";
import { usePinch } from "@use-gesture/react";

type UseTimelineZoomParams = {
    baseWidth: number;
    minZoom?: number;
    maxZoom?: number;
};

export function useTimelineZoom({
    baseWidth,
    minZoom = 0.5,
    maxZoom = 5,
}: UseTimelineZoomParams) {
    const [zoom, setZoom] = useState(1);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const zoomRef = useRef(1);

    const bindPinch = usePinch(
        ({ origin: [ox], offset: [scale], memo, first, event }) => {
            event?.preventDefault();
            if (!containerRef.current) return;

            const initZoom: number = first ? zoomRef.current : memo;
            const newZoom = Math.min(Math.max(initZoom * scale, minZoom), maxZoom);

            const container = containerRef.current;
            const { left: rectLeft } = container.getBoundingClientRect();
            const mouseX = ox - rectLeft;
            const offsetX = mouseX + container.scrollLeft;

            const prevWidth = baseWidth * zoomRef.current;
            const newWidth = baseWidth * newZoom;
            container.scrollLeft = offsetX * (newWidth / prevWidth) - mouseX;

            zoomRef.current = newZoom;
            setZoom(newZoom);

            return initZoom;
        },
        {
            pinchOnWheel: true,
            preventDefault: true,
            pointer: { touch: true },
            eventOptions: { passive: false },
        }
    );

    return {
        zoom,
        containerRef,
        bindPinch,
    };
}
