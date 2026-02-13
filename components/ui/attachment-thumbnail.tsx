"use client";

interface AttachmentThumbnailProps {
  url: string;
  filename: string;
  description?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function AttachmentThumbnail({
  url,
  filename,
  description,
  onClick,
  className = "h-20 w-20",
  children,
}: AttachmentThumbnailProps) {
  return (
    <div
      onClick={onClick}
      className={`relative rounded-md border bg-muted overflow-hidden hover:ring-2 hover:ring-primary transition-all shrink-0 group ${className}`}
    >
      <img
        src={url}
        alt={filename}
        className="w-full h-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
          if (target.parentElement) {
            target.parentElement.innerHTML = `<div class="w-full h-full bg-muted flex items-center justify-center"><svg class="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>`;
          }
        }}
      />
      {description && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 py-0.5 truncate">
          {description}
        </div>
      )}
      {children}
    </div>
  );
}
