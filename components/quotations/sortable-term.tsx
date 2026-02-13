import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SortableTermProps {
  id: string;
  text: string;
  index: number;
  onRemove: () => void;
  onChange: (val: string) => void;
  disabled: boolean;
}

export function SortableTerm({
  id,
  text,
  index,
  onRemove,
  onChange,
  disabled,
}: SortableTermProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 rounded-md border bg-background touch-none"
    >
      <div
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <span className="text-sm text-muted-foreground w-6 font-mono">
        {index + 1}.
      </span>
      <Input
        value={text}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1"
        placeholder="Enter term..."
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={onRemove}
        disabled={disabled}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
