"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  Package,
  Download,
  User,
  Phone,
  Mail,
  MapPin,
  Loader2,
  Image as ImageIcon,
  RefreshCw,
  FileText,
  Save,
  ChevronDown,
  ChevronUp,
  Ellipsis,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import { ItemReviewDialog } from "@/components/quotations/item-review-dialog";
import { AttachmentSection, type AttachmentLineItemImage } from "@/components/quotations/attachment-section";
import { PDFPreviewDialog } from "@/components/quotations/pdf-preview-dialog";
import { useItems } from "@/hooks/use-items";
import {
  generateStandalonePDF,
  generatePDF,
  saveStandaloneQuotation,
  updateQuotation,
  downloadPDF,
} from "@/hooks/use-quotations";
import { generateQuotationNumber } from "@/lib/utils";
import type {
  ItemResponse,
  ItemImage,
  LeadStatus,
  SelectedImage,
  QuotationDetailResponse,
  QuotationStatus,
} from "@/types";
import { SortableTerm } from "@/components/quotations/sortable-term";
import { QuotationFab } from "@/components/quotations/quotation-fab";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

// Default terms and conditions
const DEFAULT_TERMS = [
  "This quotation is valid for the period stated above.",
  "Payment terms: 50% deposit upon confirmation, 50% upon completion.",
  "Prices are subject to change without prior notice.",
  "Work will commence within 2 weeks of deposit payment.",
  "Any changes to the scope of work may result in additional charges.",
];

const QUOTATION_STATUSES: QuotationStatus[] = ["draft", "sent", "viewed", "accepted", "rejected", "expired"];

interface LineItem {
  id: string;
  itemId?: string | null;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  selectedImages: SelectedImage[];
  availableImages?: ItemImage[];
}

interface Group {
  id: string;
  name: string;
  description: string;
  order: number;
  lineItems: LineItem[];
  subtotal: number;
  isExpanded: boolean;
}

// ---- Public API ----

export type QuotationFormMode = "standalone" | "lead-new" | "lead-edit";

export interface QuotationFormProps {
  mode: QuotationFormMode;
  leadId?: string;
  leadData?: {
    clientName: string;
    contactNumber: string;
    email: string;
    siteAddress: string;
  };
  quotationId?: string;
  initialData?: QuotationDetailResponse;
}

export function QuotationForm({
  mode,
  leadId,
  leadData,
  quotationId,
  initialData,
}: QuotationFormProps) {
  const router = useRouter();
  const isStandalone = mode === "standalone";
  const isLeadNew = mode === "lead-new";
  const isLeadEdit = mode === "lead-edit";
  const isLeadMode = isLeadNew || isLeadEdit;

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showItemSearch, setShowItemSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  // Fetch items from library
  const { items: libraryItems, isLoading: isLoadingItems } = useItems({
    search: searchQuery,
    limit: 50,
    active: true,
  });

  // Status (only for lead modes)
  const [status, setStatus] = useState<QuotationStatus>(
    initialData?.status ?? "draft"
  );

  // Quotation Information
  const [quotationInfo, setQuotationInfo] = useState(() => {
    if (isLeadEdit && initialData) {
      const createdDate = new Date(initialData.createdAt);
      const validDate = new Date(initialData.validUntil);
      const diffMs = validDate.getTime() - createdDate.getTime();
      const diffDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
      return {
        quotationNumber: initialData.quotationNumber,
        quotationDate: createdDate,
        validityDays: diffDays,
        validUntil: format(validDate, "yyyy-MM-dd"),
      };
    }
    return {
      quotationNumber: generateQuotationNumber(),
      quotationDate: new Date(),
      validityDays: 30,
      validUntil: "",
    };
  });

  // Client Information
  const [clientInfo, setClientInfo] = useState(() => {
    if (isLeadEdit && initialData) {
      return {
        name: initialData.client.name,
        contactNumber: initialData.client.contactNumber,
        email: initialData.client.email || "",
        address: initialData.client.address || "",
      };
    }
    if (isLeadMode && leadData) {
      return {
        name: leadData.clientName,
        contactNumber: leadData.contactNumber,
        email: leadData.email || "",
        address: leadData.siteAddress || "",
      };
    }
    return { name: "", contactNumber: "", email: "", address: "" };
  });

  // Groups
  const [groups, setGroups] = useState<Group[]>(() => {
    if (isLeadEdit && initialData) {
      return initialData.groups.map((g) => ({
        id: g.id,
        name: g.name,
        description: g.description || "",
        order: g.order,
        lineItems: g.lineItems.map((li) => ({
          id: li.id,
          itemId: li.itemId,
          description: li.description,
          quantity: li.quantity,
          unit: li.unit,
          unitPrice: li.unitPrice,
          amount: li.amount,
          selectedImages: li.selectedImages || [],
          availableImages: li.availableImages || [],
        })),
        subtotal: g.subtotal,
        isExpanded: true,
      }));
    }
    return [
      {
        id: uuidv4(),
        name: "General",
        description: "",
        order: 0,
        lineItems: [],
        subtotal: 0,
        isExpanded: true,
      },
    ];
  });

  // Discount and Tax
  const [discount, setDiscount] = useState<{
    type: "percentage" | "fixed";
    value: number;
  }>(() => {
    if (isLeadEdit && initialData?.discount) {
      return {
        type: initialData.discount.type,
        value: initialData.discount.value,
      };
    }
    return { type: "percentage", value: 0 };
  });
  const [taxRate, setTaxRate] = useState(() => {
    if (isLeadEdit && initialData) return initialData.taxRate;
    return 0;
  });

  // Fetch company default tax rate for new quotations
  useEffect(() => {
    if (isLeadEdit) return;
    fetch("/api/company")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.defaultTaxRate != null) {
          setTaxRate(data.defaultTaxRate);
        }
      })
      .catch(() => {});
  }, [isLeadEdit]);

  // Hydrate availableImages from item library when editing a saved quotation
  useEffect(() => {
    if (!isLeadEdit || !initialData) return;

    const itemIds = new Set<string>();
    initialData.groups.forEach((g) =>
      g.lineItems.forEach((li) => {
        if (li.itemId) itemIds.add(li.itemId);
      })
    );

    if (itemIds.size === 0) return;

    const fetchItemImages = async () => {
      const imageMap = new Map<string, ItemImage[]>();

      await Promise.all(
        Array.from(itemIds).map(async (itemId) => {
          try {
            const res = await fetch(`/api/items/${itemId}`);
            if (res.ok) {
              const item = await res.json();
              if (item.images?.length > 0) {
                imageMap.set(itemId, item.images);
              }
            }
          } catch {
            // Item may have been deleted — fallback handled below
          }
        })
      );

      setGroups((prev) =>
        prev.map((group) => ({
          ...group,
          lineItems: group.lineItems.map((li) => {
            if (!li.itemId) return li;
            const fetched = imageMap.get(li.itemId);
            if (fetched) {
              return { ...li, availableImages: fetched };
            }
            // Fallback: reconstruct from selectedImages so user can still see them
            if (li.selectedImages.length > 0) {
              return {
                ...li,
                availableImages: li.selectedImages.map((img, i) => ({
                  url: img.url,
                  filename: img.filename,
                  order: i,
                })),
              };
            }
            return li;
          }),
        }))
      );
    };

    fetchItemImages();
  }, [isLeadEdit, initialData]);

  // Notes
  const [notes, setNotes] = useState(() => {
    if (isLeadEdit && initialData) return initialData.notes || "";
    return "";
  });

  // Terms & Conditions
  const [termsAndConditions, setTermsAndConditions] = useState<{ id: string; text: string }[]>(() => {
    if (isLeadEdit && initialData?.termsAndConditions) {
      return initialData.termsAndConditions
        .split("\n")
        .filter((t) => t.trim())
        .map((text) => ({ id: uuidv4(), text }));
    }
    return DEFAULT_TERMS.map((term) => ({ id: uuidv4(), text: term }));
  });

  // Unified Review Dialog State (handles both add & edit modes)
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    mode: "add" | "edit";
    groupId: string | null;
    lineItemId: string | null;
    itemName: string;
    availableImages: ItemImage[];
    description: string;
    selectedImageUrls: Set<string>;
  }>({
    open: false,
    mode: "add",
    groupId: null,
    lineItemId: null,
    itemName: "",
    availableImages: [],
    description: "",
    selectedImageUrls: new Set(),
  });

  // Attachment custom uploaded images
  const [attachmentCustomImages, setAttachmentCustomImages] = useState<SelectedImage[]>([]);

  // PDF Preview State
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  // Save Modal State (standalone only)
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newLeadData, setNewLeadData] = useState({
    clientName: "",
    contactNumber: "",
    email: "",
    budget: 0,
    siteAddress: "",
    status: "new" as LeadStatus,
    remark: "",
  });

  // Compute validity date
  useEffect(() => {
    const date = new Date(quotationInfo.quotationDate);
    date.setDate(date.getDate() + quotationInfo.validityDays);
    setQuotationInfo((prev) => ({
      ...prev,
      validUntil: format(date, "yyyy-MM-dd"),
    }));
  }, [quotationInfo.quotationDate, quotationInfo.validityDays]);

  // Calculations
  const calculateGroupSubtotal = useCallback((lineItems: LineItem[]) => {
    return lineItems.reduce((sum, item) => sum + item.amount, 0);
  }, []);

  const subtotal = groups.reduce(
    (sum, group) => sum + calculateGroupSubtotal(group.lineItems),
    0,
  );
  const discountAmount =
    discount.type === "percentage"
      ? (subtotal * discount.value) / 100
      : discount.value;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * taxRate) / 100;
  const total = taxableAmount + taxAmount;
  const totalLineItems = groups.reduce(
    (sum, group) => sum + group.lineItems.length,
    0,
  );

  // Aggregated attachment images from line items (deduplicated by URL)
  const attachmentLineItemImages: AttachmentLineItemImage[] = useMemo(() => {
    const seen = new Set<string>();
    const images: AttachmentLineItemImage[] = [];
    for (const group of groups) {
      for (const item of group.lineItems) {
        for (const img of item.selectedImages) {
          if (!seen.has(img.url)) {
            seen.add(img.url);
            images.push({
              url: img.url,
              filename: img.filename,
              itemDescription: item.description,
            });
          }
        }
      }
    }
    return images;
  }, [groups]);

  // Group Handlers
  const addGroup = () => {
    const newGroup: Group = {
      id: uuidv4(),
      name: `Group ${groups.length + 1}`,
      description: "",
      order: groups.length,
      lineItems: [],
      subtotal: 0,
      isExpanded: true,
    };
    setGroups([...groups, newGroup]);
  };

  const updateGroup = (
    groupId: string,
    field: keyof Group,
    value: string | number | boolean,
  ) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, [field]: value } : group,
      ),
    );
  };

  const removeGroup = (groupId: string) => {
    if (groups.length <= 1) {
      toast.error("At least one group is required");
      return;
    }
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const toggleGroupExpanded = (groupId: string) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, isExpanded: !group.isExpanded }
          : group,
      ),
    );
  };

  // Line Item Handlers
  const addLineItem = (groupId: string, item?: ItemResponse) => {
    if (item) {
      const newItemId = uuidv4();
      const newItem: LineItem = {
        id: newItemId,
        itemId: item.id,
        description: item.name,
        quantity: 1,
        unit: item.unit,
        unitPrice: item.pricePerUnit,
        amount: item.pricePerUnit,
        selectedImages: [],
        availableImages: item.images || [],
      };

      setGroups((prev) =>
        prev.map((group) =>
          group.id === groupId
            ? { ...group, lineItems: [...group.lineItems, newItem] }
            : group,
        ),
      );

      // If item has images or description, show review dialog
      if ((item.images && item.images.length > 0) || item.description) {
        setReviewDialog({
          open: true,
          mode: "add",
          groupId,
          lineItemId: newItemId,
          itemName: item.name,
          availableImages: item.images || [],
          description: item.name,
          selectedImageUrls: new Set((item.images || []).map((img) => img.url)),
        });
      }
    } else {
      const newItem: LineItem = {
        id: uuidv4(),
        itemId: null,
        description: "",
        quantity: 1,
        unit: "unit",
        unitPrice: 0,
        amount: 0,
        selectedImages: [],
      };

      setGroups((prev) =>
        prev.map((group) =>
          group.id === groupId
            ? { ...group, lineItems: [...group.lineItems, newItem] }
            : group,
        ),
      );
    }
    setShowItemSearch(false);
    setSearchQuery("");
    setActiveGroupId(null);
  };

  const updateLineItem = (
    groupId: string,
    itemId: string,
    field: keyof LineItem,
    value: string | number,
  ) => {
    setGroups((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          lineItems: group.lineItems.map((item) => {
            if (item.id !== itemId) return item;
            const updated = { ...item, [field]: value };
            if (field === "quantity" || field === "unitPrice") {
              updated.amount =
                Number(updated.quantity) * Number(updated.unitPrice);
            }
            return updated;
          }),
        };
      }),
    );
  };

  const removeLineItem = (groupId: string, itemId: string) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              lineItems: group.lineItems.filter((item) => item.id !== itemId),
            }
          : group,
      ),
    );
  };

  // Unified Review Dialog Handlers
  const handleReviewConfirm = (description: string, selectedImages: SelectedImage[]) => {
    const { groupId, lineItemId } = reviewDialog;
    if (!groupId || !lineItemId) return;

    // Find the confirmed line item's itemId for sync
    let confirmedItemId: string | null = null;
    for (const group of groups) {
      const found = group.lineItems.find((li) => li.id === lineItemId);
      if (found) {
        confirmedItemId = found.itemId || null;
        break;
      }
    }

    setGroups((prev) =>
      prev.map((group) => ({
        ...group,
        lineItems: group.lineItems.map((item) => {
          // The confirmed line item: update description + images
          if (item.id === lineItemId) {
            return { ...item, description, selectedImages };
          }
          // Sync selectedImages for other line items with the same itemId
          if (confirmedItemId && item.itemId === confirmedItemId) {
            return { ...item, selectedImages };
          }
          return item;
        }),
      })),
    );

    closeReviewDialog();
  };

  const handleReviewCancel = () => {
    // In add mode, still apply description if provided
    if (reviewDialog.mode === "add" && reviewDialog.groupId && reviewDialog.lineItemId) {
      const desc = reviewDialog.description.trim();
      if (desc) {
        setGroups((prev) =>
          prev.map((group) => ({
            ...group,
            lineItems: group.lineItems.map((item) =>
              item.id === reviewDialog.lineItemId
                ? { ...item, description: desc }
                : item,
            ),
          })),
        );
      }
    }
    closeReviewDialog();
  };

  const closeReviewDialog = () => {
    setReviewDialog({
      open: false,
      mode: "add",
      groupId: null,
      lineItemId: null,
      itemName: "",
      availableImages: [],
      description: "",
      selectedImageUrls: new Set(),
    });
  };

  // Open review dialog in edit mode (from Ellipsis button)
  const openEditReviewDialog = (groupId: string, lineItem: LineItem) => {
    setReviewDialog({
      open: true,
      mode: "edit",
      groupId,
      lineItemId: lineItem.id,
      itemName: lineItem.description,
      availableImages: lineItem.availableImages || [],
      description: lineItem.description,
      selectedImageUrls: new Set(lineItem.selectedImages.map((img) => img.url)),
    });
  };

  // Terms drag and drop handlers
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTermsAndConditions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleTermChange = (id: string, value: string) => {
    setTermsAndConditions((prev) =>
      prev.map((term) => (term.id === id ? { ...term, text: value } : term))
    );
  };

  const addTerm = () => {
    setTermsAndConditions([...termsAndConditions, { id: uuidv4(), text: "" }]);
  };

  const removeTerm = (id: string) => {
    setTermsAndConditions(termsAndConditions.filter((t) => t.id !== id));
  };

  const loadDefaultTerms = () => {
    setTermsAndConditions(
      DEFAULT_TERMS.map((term) => ({ id: uuidv4(), text: term }))
    );
  };

  // Build quotation data for API
  const buildQuotationData = () => ({
    client: {
      name: clientInfo.name,
      contactNumber: clientInfo.contactNumber,
      email: clientInfo.email || undefined,
      address: clientInfo.address || undefined,
    },
    groups: groups.map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description || undefined,
      order: group.order,
      lineItems: group.lineItems.map((item) => ({
        id: item.id,
        itemId: item.itemId,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        amount: item.amount,
        selectedImages: item.selectedImages,
      })),
      subtotal: calculateGroupSubtotal(group.lineItems),
    })),
    discount:
      discount.value > 0
        ? { type: discount.type, value: discount.value }
        : undefined,
    taxRate,
    validUntil: quotationInfo.validUntil,
    termsAndConditions: termsAndConditions
      .map((t) => t.text)
      .filter((t) => t.trim())
      .join("\n"),
    notes: notes || undefined,
    ...(isLeadMode ? { status } : {}),
  });

  // Validation
  const validateQuotation = () => {
    if (!clientInfo.name.trim()) {
      toast.error("Please enter client name");
      return false;
    }
    if (!clientInfo.contactNumber.trim()) {
      toast.error("Please enter client phone number");
      return false;
    }
    if (totalLineItems === 0) {
      toast.error("Please add at least one line item");
      return false;
    }
    for (const group of groups) {
      if (!group.name.trim()) {
        toast.error("All groups must have a name");
        return false;
      }
    }
    return true;
  };

  // PDF Handlers
  const handlePreviewPDF = async () => {
    if (!validateQuotation()) return;

    setIsGenerating(true);
    try {
      let blob: Blob;
      if (isLeadEdit && quotationId) {
        // For edit mode, use the saved quotation's PDF endpoint
        blob = await generatePDF(quotationId);
      } else {
        // For standalone and lead-new, use standalone PDF generation
        const data = buildQuotationData();
        blob = await generateStandalonePDF(data);
      }
      setPdfBlob(blob);
      setShowPDFPreview(true);
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmDownload = () => {
    if (pdfBlob) {
      const filename = isLeadEdit && initialData
        ? `${initialData.quotationNumber}.pdf`
        : "quotation.pdf";
      downloadPDF(pdfBlob, filename);
      toast.success("PDF downloaded successfully");
    }
  };

  // Save Handlers - Standalone (opens lead creation modal)
  const openSaveModal = () => {
    if (!validateQuotation()) return;

    setNewLeadData({
      clientName: clientInfo.name,
      contactNumber: clientInfo.contactNumber,
      email: clientInfo.email,
      budget: total,
      siteAddress: clientInfo.address,
      status: "new",
      remark: "",
    });
    setShowSaveModal(true);
  };

  const handleSaveStandalone = async () => {
    if (!newLeadData.clientName.trim()) {
      toast.error("Please enter lead client name");
      return;
    }
    if (!newLeadData.contactNumber.trim()) {
      toast.error("Please enter lead contact number");
      return;
    }

    setIsSaving(true);
    try {
      const quotationData = buildQuotationData();
      const result = await saveStandaloneQuotation({
        quotation: quotationData,
        createLead: true,
        lead: {
          clientName: newLeadData.clientName,
          contactNumber: newLeadData.contactNumber,
          email: newLeadData.email,
          budget: newLeadData.budget,
          siteAddress: newLeadData.siteAddress,
          status: newLeadData.status,
          remark: newLeadData.remark || undefined,
        },
      });

      toast.success("Quotation saved successfully");
      setShowSaveModal(false);
      router.push(`/quotations/${result.quotation.id}`);
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error?.error || "Failed to save quotation");
    } finally {
      setIsSaving(false);
    }
  };

  // Save Handler - Lead New
  const handleCreateLeadQuotation = async () => {
    if (!validateQuotation()) return;

    setIsSaving(true);
    try {
      const quotationData = buildQuotationData();
      const result = await saveStandaloneQuotation({
        quotation: {
          ...quotationData,
          leadId: leadId,
        },
        createLead: false,
        leadId: leadId,
      });

      toast.success("Quotation created successfully");
      router.push(`/quotations/${result.quotation.id}`);
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error?.error || "Failed to create quotation");
    } finally {
      setIsSaving(false);
    }
  };

  // Save Handler - Lead Edit
  const handleUpdateQuotation = async () => {
    if (!validateQuotation() || !quotationId) return;

    setIsSaving(true);
    try {
      const quotationData = buildQuotationData();
      await updateQuotation(quotationId, {
        ...quotationData,
        leadId: leadId,
      });

      toast.success("Quotation updated successfully");
      router.push(`/quotations/${quotationId}`);
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error?.error || "Failed to update quotation");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Mode-dependent labels ---
  const headerTitle = isStandalone
    ? "Quick Quote"
    : isLeadNew
      ? "Create Quotation"
      : "Edit Quotation";

  const headerSubtitle = isLeadNew
    ? `For ${leadData?.clientName ?? ""}`
    : isLeadEdit && initialData
      ? initialData.quotationNumber
      : undefined;

  return (
    <div className="max-w-7xl mx-auto px-2 space-y-6 pb-6 lg:pb-0">
      <QuotationFab />

      {/* Header */}
      <div className="flex items-center gap-4">
        {isLeadMode && leadId && (
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/leads/${leadId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{headerTitle}</h1>
          {headerSubtitle && (
            <p className="text-muted-foreground">{headerSubtitle}</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Quotation Information */}
          <Card id="info-section" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Quotation Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Show quotation number in edit mode (read-only) */}
                {isLeadEdit && (
                  <div className="space-y-2">
                    <Label>Quotation Number</Label>
                    <Input
                      value={initialData?.quotationNumber ?? ""}
                      readOnly
                      disabled
                      className="bg-muted text-muted-foreground"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor="quotationDate"
                    className="flex items-center gap-2"
                  >
                    Quotation Date
                  </Label>
                  <DatePicker
                    id="quotationDate"
                    value={quotationInfo.quotationDate}
                    onChange={(date) =>
                      setQuotationInfo({
                        ...quotationInfo,
                        quotationDate: date || new Date(),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validityDays">Validity (Days)</Label>
                  <div className="flex gap-2 items-center">
                    <NumericInput
                      id="validityDays"
                      mode="integer"
                      value={quotationInfo.validityDays}
                      onValueChange={(val) =>
                        setQuotationInfo({
                          ...quotationInfo,
                          validityDays: val,
                        })
                      }
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">
                      Valid until: {quotationInfo.validUntil}
                    </span>
                  </div>
                </div>

                {/* Status field - lead modes only */}
                {isLeadMode && (
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={(val) => setStatus(val as QuotationStatus)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QUOTATION_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            <span className="capitalize">{s}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card id="client-section" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="text-lg">Client Information</CardTitle>
              {isLeadMode && (
                <p className="text-sm text-muted-foreground">From lead (read-only)</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clientName">
                    Client Name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="clientName"
                      placeholder="John Smith"
                      value={clientInfo.name}
                      onChange={(e) =>
                        setClientInfo({ ...clientInfo, name: e.target.value })
                      }
                      className="pl-10"
                      disabled={isLeadMode}
                      readOnly={isLeadMode}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="clientPhone"
                      placeholder="+65 9123 4567"
                      value={clientInfo.contactNumber}
                      onChange={(e) =>
                        setClientInfo({
                          ...clientInfo,
                          contactNumber: e.target.value,
                        })
                      }
                      className="pl-10"
                      disabled={isLeadMode}
                      readOnly={isLeadMode}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="clientEmail"
                      type="email"
                      placeholder="john@email.com"
                      value={clientInfo.email}
                      onChange={(e) =>
                        setClientInfo({ ...clientInfo, email: e.target.value })
                      }
                      className="pl-10"
                      disabled={isLeadMode}
                      readOnly={isLeadMode}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientAddress">Site Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="clientAddress"
                      placeholder="123 Orchard Road #12-34"
                      value={clientInfo.address}
                      onChange={(e) =>
                        setClientInfo({ ...clientInfo, address: e.target.value })
                      }
                      className="pl-10"
                      disabled={isLeadMode}
                      readOnly={isLeadMode}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Groups */}
          <Card id="groups-section" className="scroll-mt-24">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <h2 className="text-lg font-semibold">Groups</h2>
              <Button size="sm" onClick={addGroup}>
                <Plus className="h-4 w-4 mr-2" />
                Add Group
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              {groups.map((group) => (
                <Card key={group.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleGroupExpanded(group.id)}
                        >
                          {group.isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        <Input
                          value={group.name}
                          onChange={(e) =>
                            updateGroup(group.id, "name", e.target.value)
                          }
                          className="h-8 text-sm font-medium max-w-[200px]"
                          placeholder="Group name"
                        />
                        <Badge variant="secondary">
                          {group.lineItems.length} item
                          {group.lineItems.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          $
                          {calculateGroupSubtotal(group.lineItems).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                            },
                          )}
                        </span>
                        {groups.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeGroup(group.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {group.isExpanded && (
                      <div className="mt-2">
                        <Input
                          value={group.description}
                          onChange={(e) =>
                            updateGroup(group.id, "description", e.target.value)
                          }
                          className="h-8 text-sm"
                          placeholder="Group description (optional)"
                        />
                      </div>
                    )}
                  </CardHeader>

                  {group.isExpanded && (
                    <CardContent>
                      {/* Line Items Table */}
                      <div className="space-y-3 min-width-[500px]">
                        {/* Header */}
                        <div className="hidden sm:grid sm:grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-2">
                          <div className="col-span-4">Item</div>
                          <div className="col-span-1 text-center">Qty</div>
                          <div className="col-span-2 text-center">Unit</div>
                          <div className="col-span-2 text-right">Unit Price</div>
                          <div className="col-span-2 text-center">Amount</div>
                          <div className="col-span-1 text-right">Action</div>
                        </div>

                        {/* Line Items */}
                        {group.lineItems.map((item) => (
                          <div
                            key={item.id}
                            className="border rounded-lg p-3 sm:p-2 space-y-2 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-2 sm:items-center"
                          >
                            <div className="sm:col-span-4">
                              <Input
                                value={item.description}
                                onChange={(e) =>
                                  updateLineItem(
                                    group.id,
                                    item.id,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                placeholder="Item name"
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="sm:col-span-1">
                              <NumericInput
                                mode="integer"
                                value={item.quantity}
                                onValueChange={(val) =>
                                  updateLineItem(
                                    group.id,
                                    item.id,
                                    "quantity",
                                    val,
                                  )
                                }
                                className="h-8 text-sm text-center"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <Input
                                value={item.unit}
                                onChange={(e) =>
                                  updateLineItem(
                                    group.id,
                                    item.id,
                                    "unit",
                                    e.target.value,
                                  )
                                }
                                className="h-8 text-sm text-center"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <NumericInput
                                value={item.unitPrice}
                                onValueChange={(val) =>
                                  updateLineItem(
                                    group.id,
                                    item.id,
                                    "unitPrice",
                                    val,
                                  )
                                }
                                className="h-8 text-sm text-right"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <p className="text-sm text-center font-semibold">
                                RM
                                {item.amount.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                              </p>
                            </div>
                            <div className="flex items-center justify-end gap-1 col-span-1">
                              <div className="relative">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    openEditReviewDialog(group.id, item)
                                  }
                                >
                                  <Ellipsis className="h-4 w-4" />
                                </Button>
                                {item.selectedImages.length > 0 && (
                                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                                    {item.selectedImages.length}
                                  </span>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => removeLineItem(group.id, item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}

                        {group.lineItems.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No items in this group</p>
                          </div>
                        )}
                      </div>

                      {/* Add Item Buttons */}
                      <div className="flex justify-end gap-2 my-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveGroupId(group.id);
                            setShowItemSearch(true);
                          }}
                        >
                          <Package className="h-4 w-4 mr-2" />
                          From Library
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => addLineItem(group.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Custom Item
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Attachment Section */}
          <AttachmentSection
            lineItemImages={attachmentLineItemImages}
            customImages={attachmentCustomImages}
            onCustomImagesChange={setAttachmentCustomImages}
          />

          {/* Terms & Conditions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Terms & Conditions</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" onClick={addTerm}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Term
                </Button>
                <Button variant="ghost" size="sm" onClick={loadDefaultTerms}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={termsAndConditions.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {termsAndConditions.map((term, index) => (
                      <SortableTerm
                        key={term.id}
                        id={term.id}
                        index={index}
                        text={term.text}
                        onRemove={() => removeTerm(term.id)}
                        onChange={(val) => handleTermChange(term.id, val)}
                        disabled={termsAndConditions.length === 1}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Drag items to reorder terms and conditions.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6 xl:sticky xl:top-20 xl:self-start">
          {/* Totals */}
          <Card id="summary-section" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({totalLineItems} items)</span>
                  <span>
                    $
                    {subtotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>Discount</span>
                    <Select
                      value={discount.type}
                      onValueChange={(val: "percentage" | "fixed") =>
                        setDiscount({ ...discount, type: val })
                      }
                    >
                      <SelectTrigger className="h-7 w-16 text-xs px-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">%</SelectItem>
                        <SelectItem value="fixed">RM</SelectItem>
                      </SelectContent>
                    </Select>

                    <NumericInput
                      value={discount.value || ""}
                      onValueChange={(val) =>
                        setDiscount({ ...discount, value: val })
                      }
                      className="h-7 w-16 text-xs text-center"
                    />
                  </div>
                  <span className="text-red-600">
                    - RM
                    {discountAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>GST</span>

                    <NumericInput
                      value={taxRate}
                      onValueChange={(val) => setTaxRate(val)}
                      className="h-7 w-16 text-xs text-center"
                    />
                    <span>%</span>
                  </div>
                  <span>
                    $
                    {taxAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>
                    ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons - Mode Dependent */}
          <div className="flex gap-3 border-t pt-4 bg-muted/20">
            {isStandalone && (
              <>
                <Button variant="outline" onClick={() => openSaveModal()} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save as Lead
                </Button>
                <Button onClick={handlePreviewPDF} disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>
              </>
            )}

            {isLeadNew && (
              <>
                <Button
                  onClick={handleCreateLeadQuotation}
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePreviewPDF}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview PDF
                    </>
                  )}
                </Button>
              </>
            )}

            {isLeadEdit && (
              <>
                <Button
                  variant="outline"
                  onClick={handlePreviewPDF}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview PDF
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleUpdateQuotation}
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Quotation
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Item Search Dialog */}
      <Dialog
        open={showItemSearch}
        onOpenChange={(open) => {
          setShowItemSearch(open);
          if (!open) {
            setActiveGroupId(null);
            setSearchQuery("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Item from Library</DialogTitle>
            <DialogDescription>
              Search and select a preset item to add
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {isLoadingItems ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : libraryItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No items found
                </p>
              ) : (
                libraryItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (activeGroupId) {
                        addLineItem(activeGroupId, item);
                      }
                    }}
                    className="w-full p-3 rounded-lg border hover:bg-accent transition-colors text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{item.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.category && (
                            <span className="text-xs text-muted-foreground">{item.category}</span>
                          )}
                          {item.images.length > 0 && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 gap-1">
                              <ImageIcon className="h-3 w-3" />
                              {item.images.length}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-sm">
                          ${item.pricePerUnit.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.unit}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unified Item Review Dialog (add + edit modes) */}
      <ItemReviewDialog
        open={reviewDialog.open}
        onOpenChange={(open) => {
          if (!open) handleReviewCancel();
        }}
        mode={reviewDialog.mode}
        itemName={reviewDialog.itemName}
        availableImages={reviewDialog.availableImages}
        description={reviewDialog.description}
        selectedImageUrls={reviewDialog.selectedImageUrls}
        onConfirm={handleReviewConfirm}
        onCancel={handleReviewCancel}
      />

      {/* Save Modal (Standalone only) */}
      {isStandalone && (
        <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Save Quotation</DialogTitle>
              <DialogDescription>
                Create a new lead and save the quotation
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-4 border rounded-lg p-4">
                <h3 className="font-medium">New Lead Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      Client Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={newLeadData.clientName}
                      onChange={(e) =>
                        setNewLeadData({
                          ...newLeadData,
                          clientName: e.target.value,
                        })
                      }
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Contact Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={newLeadData.contactNumber}
                      onChange={(e) =>
                        setNewLeadData({
                          ...newLeadData,
                          contactNumber: e.target.value,
                        })
                      }
                      placeholder="+65 9123 4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newLeadData.email}
                      onChange={(e) =>
                        setNewLeadData({
                          ...newLeadData,
                          email: e.target.value,
                        })
                      }
                      placeholder="john@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Budget (RM)</Label>
                    <div className="relative">
                      <NumericInput
                        value={newLeadData.budget}
                        onValueChange={(val) =>
                          setNewLeadData({
                            ...newLeadData,
                            budget: val,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Site Address</Label>
                    <Input
                      value={newLeadData.siteAddress}
                      onChange={(e) =>
                        setNewLeadData({
                          ...newLeadData,
                          siteAddress: e.target.value,
                        })
                      }
                      placeholder="123 Orchard Road #12-34"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Remark</Label>
                    <Input
                      value={newLeadData.remark}
                      onChange={(e) =>
                        setNewLeadData({
                          ...newLeadData,
                          remark: e.target.value,
                        })
                      }
                      placeholder="Any notes about this lead..."
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSaveModal(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveStandalone} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Quotation
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* PDF Preview Dialog */}
      <PDFPreviewDialog
        open={showPDFPreview}
        onOpenChange={setShowPDFPreview}
        pdfBlob={pdfBlob}
        filename={
          isLeadEdit && initialData
            ? `${initialData.quotationNumber}.pdf`
            : "quotation.pdf"
        }
        onDownload={handleConfirmDownload}
        isGenerating={isGenerating}
      />
    </div>
  );
}
