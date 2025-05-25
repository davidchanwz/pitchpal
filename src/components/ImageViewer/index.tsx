import { useState } from "react";
import clsx from "clsx";
import { Button } from "primereact/button";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { Breakpoints, useBreakpoint } from "@/hooks/useBreakpoint";
import { ImageViewerProps } from "./types";
import styles from './index.module.css';

function ImageViewer(props: ImageViewerProps) {
  const { src, icon } = props
  const isTablet = useBreakpoint(Breakpoints.Tablet);
  const dragControls = useDragControls();
  const [isImageOpen, setIsImageOpen] = useState(false);

  return (
    <>
      <motion.div whileHover={{ scale: 1.2 }}>
        <Button
          rounded
          severity="contrast"
          onClick={() => setIsImageOpen((curr) => !curr)}
          icon={icon}
        />
      </motion.div>
      <AnimatePresence mode="wait">
        {isImageOpen && (
          <motion.div
            drag
            onPointerDown={(e) => dragControls.start(e)}
            dragControls={dragControls}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute right-0 top-0 mt-3 mr-3 cursor-move z-5"
          >
            <div className="relative surface-card p-2 shadow-4 border-round">
              <img
                src={src}
                className={clsx("border-round", styles.noDraggableImage)}
                width={window.screen.width * (isTablet ? 0.8 : 0.4)}
                style={{ maxWidth: 600 }}
              />
              <div className="flex justify-content-end mt-1">
                <Button
                  severity="secondary"
                  label="Close"
                  onClick={() => setIsImageOpen(false)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ImageViewer
