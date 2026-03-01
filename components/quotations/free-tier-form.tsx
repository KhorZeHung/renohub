"use client";

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { format, addDays } from "date-fns";
import {
  Plus,
  Trash2,
  Download,
  User,
  Phone,
  Mail,
  MapPin,
  Loader2,
  ChevronDown,
  ChevronUp,
  Building2,
  FileText,
  RefreshCw,
  UserPlus,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import { SortableTerm } from "@/components/quotations/sortable-term";
import { MarketingHeader } from "@/components/marketing/marketing-header";
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

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
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

function createDefaultGroup(order: number): Group {
  return {
    id: uuidv4(),
    name: order === 0 ? "General" : `Group ${order + 1}`,
    description: "",
    order,
    lineItems: [
      {
        id: uuidv4(),
        description: "",
        quantity: 1,
        unit: "unit",
        unitPrice: 0,
        amount: 0,
      },
    ],
    subtotal: 0,
    isExpanded: true,
  };
}

export function FreeTierForm() {
  // Company Information
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    email: "",
    contactNumber: "",
    address: "",
  });

  // Quotation Details
  const [validUntil, setValidUntil] = useState<Date>(addDays(new Date(), 30));

  // Client Information
  const [clientInfo, setClientInfo] = useState({
    name: "",
    contactNumber: "",
    email: "",
    address: "",
  });

  // Groups & Line Items
  const [groups, setGroups] = useState<Group[]>([createDefaultGroup(0)]);

  // Discount & Tax
  const [discount, setDiscount] = useState<{
    type: "percentage" | "fixed";
    value: number;
  }>({ type: "percentage", value: 0 });
  const [taxRate, setTaxRate] = useState(0);

  // Terms & Conditions
  const [termsAndConditions, setTermsAndConditions] = useState<
    { id: string; text: string }[]
  >(DEFAULT_TERMS.map((term) => ({ id: uuidv4(), text: term })));

  // Notes
  const [notes, setNotes] = useState("");

  // Loading state
  const [isGenerating, setIsGenerating] = useState(false);

  // Lead modal state
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  // ---- Calculations ----
  const calculateGroupSubtotal = useCallback((lineItems: LineItem[]) => {
    return lineItems.reduce((sum, item) => sum + item.amount, 0);
  }, []);

  const subtotal = groups.reduce(
    (sum, group) => sum + calculateGroupSubtotal(group.lineItems),
    0
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
    0
  );

  // ---- Group Handlers ----
  const addGroup = () => {
    setGroups((prev) => [...prev, createDefaultGroup(prev.length)]);
  };

  const updateGroup = (
    groupId: string,
    field: keyof Pick<Group, "name" | "description">,
    value: string
  ) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, [field]: value } : g))
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
      prev.map((g) =>
        g.id === groupId ? { ...g, isExpanded: !g.isExpanded } : g
      )
    );
  };

  // ---- Line Item Handlers ----
  const addLineItem = (groupId: string) => {
    const newItem: LineItem = {
      id: uuidv4(),
      description: "",
      quantity: 1,
      unit: "unit",
      unitPrice: 0,
      amount: 0,
    };
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, lineItems: [...g.lineItems, newItem] }
          : g
      )
    );
  };

  const updateLineItem = (
    groupId: string,
    itemId: string,
    field: keyof LineItem,
    value: string | number
  ) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          lineItems: g.lineItems.map((item) => {
            if (item.id !== itemId) return item;
            const updated = { ...item, [field]: value };
            if (field === "quantity" || field === "unitPrice") {
              updated.amount =
                Number(updated.quantity) * Number(updated.unitPrice);
            }
            return updated;
          }),
        };
      })
    );
  };

  const removeLineItem = (groupId: string, itemId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, lineItems: g.lineItems.filter((i) => i.id !== itemId) }
          : g
      )
    );
  };

  // ---- Terms Drag & Drop ----
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
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleTermChange = (id: string, value: string) => {
    setTermsAndConditions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: value } : t))
    );
  };

  const addTerm = () => {
    setTermsAndConditions((prev) => [...prev, { id: uuidv4(), text: "" }]);
  };

  const removeTerm = (id: string) => {
    setTermsAndConditions((prev) => prev.filter((t) => t.id !== id));
  };

  const loadDefaultTerms = () => {
    setTermsAndConditions(
      DEFAULT_TERMS.map((term) => ({ id: uuidv4(), text: term }))
    );
  };

  // ---- Validation ----
  const validateForm = () => {
    if (!companyInfo.name.trim()) {
      toast.error("Please enter your company name");
      return false;
    }
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
      for (const item of group.lineItems) {
        if (!item.description.trim()) {
          toast.error("All line items must have a description");
          return false;
        }
      }
    }
    return true;
  };

  // ---- Download PDF ----
  const handleDownloadPDF = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    try {
      const payload = {
        company: {
          name: companyInfo.name,
          email: companyInfo.email || undefined,
          contactNumber: companyInfo.contactNumber || undefined,
          address: companyInfo.address || undefined,
        },
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
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            amount: item.amount,
            selectedImages: [],
          })),
          subtotal: calculateGroupSubtotal(group.lineItems),
        })),
        discount:
          discount.value > 0
            ? { type: discount.type, value: discount.value }
            : undefined,
        taxRate,
        validUntil: format(validUntil, "yyyy-MM-dd"),
        termsAndConditions: termsAndConditions
          .map((t) => t.text)
          .filter((t) => t.trim())
          .join("\n"),
        notes: notes || undefined,
      };

      const response = await fetch("/api/quotations/public/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "quotation.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully");
    } catch (error: unknown) {
      console.error("PDF generation error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to generate PDF";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  // ---- Render ----
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      <MarketingHeader />

      {/* Page Title Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold leading-tight">
              Free Quotation Generator
            </h1>
            <p className="text-xs text-muted-foreground leading-tight">
              No sign-up required — fill in the details and download your PDF
            </p>
          </div>
          <Button
            variant="default"
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            size="sm"
            className="shrink-0"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isGenerating ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Company Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-primary" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="company-name">
                  Company Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="company-name"
                  placeholder="Your company name"
                  value={companyInfo.name}
                  onChange={(e) =>
                    setCompanyInfo((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company-email">
                  <Mail className="inline h-3 w-3 mr-1 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="company-email"
                  type="email"
                  placeholder="company@example.com"
                  value={companyInfo.email}
                  onChange={(e) =>
                    setCompanyInfo((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company-phone">
                  <Phone className="inline h-3 w-3 mr-1 text-muted-foreground" />
                  Phone
                </Label>
                <Input
                  id="company-phone"
                  placeholder="+60 12-345 6789"
                  value={companyInfo.contactNumber}
                  onChange={(e) =>
                    setCompanyInfo((p) => ({
                      ...p,
                      contactNumber: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="company-address">
                  <MapPin className="inline h-3 w-3 mr-1 text-muted-foreground" />
                  Address
                </Label>
                <Input
                  id="company-address"
                  placeholder="Company address"
                  value={companyInfo.address}
                  onChange={(e) =>
                    setCompanyInfo((p) => ({ ...p, address: e.target.value }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quotation Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quotation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label>Valid Until</Label>
              <DatePicker
                value={validUntil}
                onChange={(d) => d && setValidUntil(d)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-primary" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="client-name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="client-name"
                  placeholder="Client name"
                  value={clientInfo.name}
                  onChange={(e) =>
                    setClientInfo((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="client-phone">
                  <Phone className="inline h-3 w-3 mr-1 text-muted-foreground" />
                  Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="client-phone"
                  placeholder="+60 12-345 6789"
                  value={clientInfo.contactNumber}
                  onChange={(e) =>
                    setClientInfo((p) => ({
                      ...p,
                      contactNumber: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="client-email">
                  <Mail className="inline h-3 w-3 mr-1 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="client-email"
                  type="email"
                  placeholder="client@example.com"
                  value={clientInfo.email}
                  onChange={(e) =>
                    setClientInfo((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="client-address">
                  <MapPin className="inline h-3 w-3 mr-1 text-muted-foreground" />
                  Address
                </Label>
                <Input
                  id="client-address"
                  placeholder="Site / delivery address"
                  value={clientInfo.address}
                  onChange={(e) =>
                    setClientInfo((p) => ({ ...p, address: e.target.value }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <div className="space-y-4">
          {groups.map((group) => (
            <Card key={group.id}>
              {/* Group Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-2 gap-2">
                <div className="flex-1 min-w-0">
                  <Input
                    value={group.name}
                    onChange={(e) =>
                      updateGroup(group.id, "name", e.target.value)
                    }
                    placeholder="Group name"
                    className="font-medium h-8 text-sm"
                  />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Badge variant="secondary" className="text-xs">
                    {group.lineItems.length} item
                    {group.lineItems.length !== 1 ? "s" : ""}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => toggleGroupExpanded(group.id)}
                  >
                    {group.isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => removeGroup(group.id)}
                    disabled={groups.length <= 1}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {group.isExpanded && (
                <CardContent className="pt-0 space-y-3">
                  {/* Optional group description */}
                  <Input
                    value={group.description}
                    onChange={(e) =>
                      updateGroup(group.id, "description", e.target.value)
                    }
                    placeholder="Group description (optional)"
                    className="text-xs h-7"
                  />

                  {/* Column headers — hidden on mobile */}
                  {group.lineItems.length > 0 && (
                    <div className="hidden sm:grid grid-cols-[1fr_80px_80px_90px_80px_32px] gap-2 px-1">
                      <span className="text-xs text-muted-foreground">
                        Description
                      </span>
                      <span className="text-xs text-muted-foreground text-center">
                        Qty
                      </span>
                      <span className="text-xs text-muted-foreground text-center">
                        Unit
                      </span>
                      <span className="text-xs text-muted-foreground text-right">
                        Unit Price
                      </span>
                      <span className="text-xs text-muted-foreground text-right">
                        Amount
                      </span>
                      <span />
                    </div>
                  )}

                  {/* Line Items */}
                  <div className="space-y-2">
                    {group.lineItems.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-1 sm:grid-cols-[1fr_80px_80px_90px_80px_32px] gap-2 items-center"
                      >
                        <Input
                          value={item.description}
                          onChange={(e) =>
                            updateLineItem(
                              group.id,
                              item.id,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Item description"
                          className="h-8 text-sm"
                        />
                        <NumericInput
                          value={item.quantity}
                          onValueChange={(v) =>
                            updateLineItem(group.id, item.id, "quantity", v)
                          }
                          min={0.01}
                          className="h-8 text-sm text-center"
                          placeholder="Qty"
                        />
                        <Input
                          value={item.unit}
                          onChange={(e) =>
                            updateLineItem(
                              group.id,
                              item.id,
                              "unit",
                              e.target.value
                            )
                          }
                          placeholder="unit"
                          className="h-8 text-sm text-center"
                        />
                        <NumericInput
                          value={item.unitPrice}
                          onValueChange={(v) =>
                            updateLineItem(group.id, item.id, "unitPrice", v)
                          }
                          min={0}
                          className="h-8 text-sm text-right"
                          placeholder="0.00"
                        />
                        <div className="text-sm text-right font-medium py-1 px-1 tabular-nums">
                          {item.amount.toFixed(2)}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeLineItem(group.id, item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs border-dashed"
                    onClick={() => addLineItem(group.id)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Add Line Item
                  </Button>

                  {/* Group subtotal */}
                  {group.lineItems.length > 0 && (
                    <div className="flex justify-end pt-1">
                      <span className="text-xs text-muted-foreground mr-2">
                        Group subtotal:
                      </span>
                      <span className="text-xs font-semibold tabular-nums">
                        {calculateGroupSubtotal(group.lineItems).toFixed(2)}
                      </span>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="w-full border-dashed"
            onClick={addGroup}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Group
          </Button>
        </div>

        {/* Discount & Tax */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Discount & Tax</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Discount */}
            <div className="grid grid-cols-[120px_1fr] gap-3 items-end">
              <div className="space-y-1.5">
                <Label>Discount Type</Label>
                <Select
                  value={discount.type}
                  onValueChange={(v) =>
                    setDiscount((p) => ({
                      ...p,
                      type: v as "percentage" | "fixed",
                    }))
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">%</SelectItem>
                    <SelectItem value="fixed">Fixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>
                  Discount{" "}
                  {discount.type === "percentage" ? "(%)" : "(Amount)"}
                </Label>
                <NumericInput
                  value={discount.value}
                  onValueChange={(v) =>
                    setDiscount((p) => ({ ...p, value: v }))
                  }
                  min={0}
                  max={discount.type === "percentage" ? 100 : undefined}
                  className="h-9"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Tax Rate */}
            <div className="space-y-1.5">
              <Label>Tax Rate (%)</Label>
              <NumericInput
                value={taxRate}
                onValueChange={setTaxRate}
                min={0}
                max={100}
                className="h-9"
                placeholder="0"
              />
            </div>

            <Separator />

            {/* Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{subtotal.toFixed(2)}</span>
              </div>
              {discount.value > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>
                    Discount (
                    {discount.type === "percentage"
                      ? `${discount.value}%`
                      : "fixed"}
                    )
                  </span>
                  <span className="tabular-nums">
                    -{discountAmount.toFixed(2)}
                  </span>
                </div>
              )}
              {taxRate > 0 && (
                <>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxable Amount</span>
                    <span className="tabular-nums">
                      {taxableAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax ({taxRate}%)</span>
                    <span className="tabular-nums">{taxAmount.toFixed(2)}</span>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-base pt-1">
                <span>Total</span>
                <span className="tabular-nums">{total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms & Conditions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Terms & Conditions</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={loadDefaultTerms}
              >
                <RefreshCw className="h-3 w-3" />
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={termsAndConditions.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {termsAndConditions.map((term, index) => (
                    <SortableTerm
                      key={term.id}
                      id={term.id}
                      index={index}
                      text={term.text}
                      disabled={false}
                      onChange={(val) => handleTermChange(term.id, val)}
                      onRemove={() => removeTerm(term.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-dashed text-xs h-8"
              onClick={addTerm}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Term
            </Button>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes or instructions (optional)"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </CardContent>
        </Card>

        {/* Bottom Actions */}
        <div className="pb-6 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12 text-base font-medium"
              onClick={() => setIsLeadModalOpen(true)}
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Save as Lead
            </Button>
            <Button
              variant="default"
              className="flex-1 h-12 text-base font-medium"
              onClick={handleDownloadPDF}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Download className="h-5 w-5 mr-2" />
              )}
              {isGenerating ? "Generating PDF..." : "Download PDF"}
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Want to save quotations and manage leads?{" "}
            <a href="/register" className="text-primary hover:underline">
              Sign up free
            </a>
          </p>
        </div>
      </div>

      {/* Save as Lead Marketing Modal */}
      <Dialog open={isLeadModalOpen} onOpenChange={setIsLeadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-primary" />
              <DialogTitle>Save & Manage Your Leads</DialogTitle>
            </div>
            <DialogDescription>
              Sign up free to unlock the full RenoHub experience.
            </DialogDescription>
          </DialogHeader>

          <ul className="space-y-2.5 py-2">
            {[
              "Save and revisit unlimited quotations",
              "Track leads and follow-up status",
              "Professional branded PDF templates",
              "Client history and contact management",
              "Collaborate with your team",
            ].map((benefit) => (
              <li key={benefit} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
            <Button variant="default" className="flex-1" asChild>
              <a href="/register">Sign Up Free</a>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <a href="/login">Sign In</a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
