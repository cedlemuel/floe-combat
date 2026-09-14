import { useDragControls, Reorder } from "framer-motion";
import { FaGripVertical, FaTrash, FaCloudUploadAlt } from "react-icons/fa";
import type { ReorderableMediaItemProps } from "../../../types/admintypes";

const ReorderableMediaItem = ({
  item,
  index,
  isSubmitting,
  onRemove,
  onRemoveThumbnail,
  onAddThumbnail,
}: ReorderableMediaItemProps) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={dragControls}
      whileDrag={{
        scale: 1.02,
        zIndex: 50,
      }}
      className="flex flex-col gap-3 border border-borderColor bg-black p-3 sm:flex-row"
    >
      <div className="flex items-center justify-between sm:flex-col sm:justify-center">
        <button
          type="button"
          disabled={isSubmitting}
          onPointerDown={(e) => {
            if (isSubmitting) return;

            dragControls.start(e);
          }}
          aria-label={`Drag media ${index + 1} to reorder`}
          className="touch-none flex h-9 w-9 cursor-grab items-center justify-center text-descText2 transition hover:text-floesky active:cursor-grabbing disabled:cursor-default disabled:opacity-30"
        >
          <FaGripVertical size={15} />
        </button>

        <span className="font-montserrat text-[9px] tracking-wider text-descText2 sm:hidden">
          DRAG
        </span>
      </div>

      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-white/5 sm:w-40">
        {item.media_type === "image" ? (
          <img
            src={item.previewUrl}
            alt={`Highlight media ${index + 1}`}
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <video
            src={item.previewUrl}
            className="h-full w-full object-cover"
            muted
            playsInline
            draggable={false}
          />
        )}

        <span
          className={`absolute left-2 top-2 px-2 py-1 font-montserrat text-[9px] font-bold uppercase tracking-wider ${
            item.media_type === "video"
              ? "bg-floesky/80 text-black"
              : "bg-black/70 text-white"
          }`}
        >
          {item.media_type}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-montserrat text-xs font-bold text-white">
              MEDIA {index + 1}
            </span>

            <span className="hidden font-montserrat text-[9px] tracking-wider text-descText2 sm:inline">
              DRAG HANDLE TO REORDER
            </span>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onRemove(item.key)}
            aria-label="Remove media"
            className="flex h-7 w-7 items-center justify-center text-descText transition hover:text-red-400 disabled:opacity-20"
          >
            <FaTrash size={10} />
          </button>
        </div>

        {item.media_type === "video" && (
          <div className="flex flex-col gap-2 border-l-2 border-floesky/20 pl-3">
            <span className="font-montserrat text-[10px] tracking-wider text-descText">
              CUSTOM THUMBNAIL (OPTIONAL)
            </span>

            {item.thumbnailPreviewUrl && (
              <div className="flex items-center gap-3">
                <img
                  src={item.thumbnailPreviewUrl}
                  alt="Video thumbnail"
                  className="h-14 w-20 border border-borderColor object-cover"
                  draggable={false}
                />

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => onRemoveThumbnail(item.key)}
                  className="font-montserrat text-[10px] font-bold tracking-wider text-red-400"
                >
                  REMOVE
                </button>
              </div>
            )}

            <label className="flex w-fit cursor-pointer items-center gap-2 border border-borderColor px-3 py-2 font-montserrat text-[10px] font-bold tracking-wider text-descText transition hover:border-floesky hover:text-floesky">
              <FaCloudUploadAlt size={11} />

              {item.thumbnailPreviewUrl ? "REPLACE THUMBNAIL" : "ADD THUMBNAIL"}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={isSubmitting}
                onChange={(e) => {
                  onAddThumbnail(item.key, e.target.files?.[0]);

                  e.target.value = "";
                }}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>
    </Reorder.Item>
  );
};

export default ReorderableMediaItem;
