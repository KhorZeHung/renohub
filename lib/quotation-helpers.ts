import type {
  ILineItem,
  IQuotationGroup,
  IQuotationDiscount,
  ISelectedImage,
} from "./models/quotation";

/**
 * Round a number to 2 decimal places
 */
export function roundToTwo(num: number): number {
  return Math.round(num * 100) / 100;
}

/**
 * Calculate line item amount (quantity * unitPrice - discount)
 */
export function calculateLineItemAmount(item: {
  quantity: number;
  unitPrice: number;
  discount?: { type: "percentage" | "fixed"; value: number };
}): number {
  const baseAmount = item.quantity * item.unitPrice;

  if (!item.discount || item.discount.value <= 0) {
    return roundToTwo(baseAmount);
  }

  const discountAmount =
    item.discount.type === "percentage"
      ? (baseAmount * item.discount.value) / 100
      : item.discount.value;

  return roundToTwo(Math.max(0, baseAmount - discountAmount));
}

/**
 * Calculate group subtotal (sum of all line item amounts)
 */
export function calculateGroupSubtotal(lineItems: ILineItem[]): number {
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  return roundToTwo(subtotal);
}

/**
 * Calculate document-level discount amount
 */
export function calculateDiscountAmount(
  subtotal: number,
  discount?: { type: "percentage" | "fixed"; value: number }
): number {
  if (!discount || discount.value <= 0) {
    return 0;
  }

  if (discount.type === "percentage") {
    return roundToTwo((subtotal * discount.value) / 100);
  }

  return roundToTwo(Math.min(discount.value, subtotal));
}

/**
 * Calculate all quotation totals from groups
 */
export interface QuotationTotals {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  total: number;
}

export function calculateQuotationTotals(
  groups: IQuotationGroup[],
  discount: { type: "percentage" | "fixed"; value: number } | undefined,
  taxRate: number
): QuotationTotals {
  // Calculate overall subtotal (sum of all group subtotals)
  const subtotal = roundToTwo(
    groups.reduce((sum, group) => sum + group.subtotal, 0)
  );

  // Calculate discount amount
  const discountAmount = calculateDiscountAmount(subtotal, discount);

  // Calculate taxable amount
  const taxableAmount = roundToTwo(Math.max(0, subtotal - discountAmount));

  // Calculate tax amount
  const taxAmount = roundToTwo((taxableAmount * taxRate) / 100);

  // Calculate total
  const total = roundToTwo(taxableAmount + taxAmount);

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    total,
  };
}

/**
 * Process groups and recalculate all amounts
 * This ensures line item amounts and group subtotals are correct
 */
export function processGroups(
  groups: Array<{
    id: string;
    name: string;
    description?: string | null;
    order: number;
    lineItems: Array<{
      id: string;
      itemId?: string | null;
      description: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      amount?: number;
      discount?: { type: "percentage" | "fixed"; value: number };
      selectedImages?: Array<{ url: string; filename: string; caption?: string | null }>;
    }>;
    subtotal?: number;
  }>
): IQuotationGroup[] {
  return groups.map((group, groupIndex) => {
    // Process line items and calculate amounts
    const processedLineItems: ILineItem[] = group.lineItems.map((item) => {
      const amount = calculateLineItemAmount({
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
      });

      return {
        id: item.id,
        itemId: item.itemId ? item.itemId : null,
        description: item.description,
        quantity: roundToTwo(item.quantity),
        unit: item.unit,
        unitPrice: roundToTwo(item.unitPrice),
        amount,
        discount: item.discount,
        selectedImages: (item.selectedImages || []).map((img) => ({
          url: img.url,
          filename: img.filename,
          caption: img.caption || undefined,
        })),
      } as ILineItem;
    });

    // Calculate group subtotal
    const subtotal = calculateGroupSubtotal(processedLineItems);

    return {
      id: group.id,
      name: group.name,
      description: group.description || undefined,
      order: group.order ?? groupIndex,
      lineItems: processedLineItems,
      subtotal,
    };
  });
}

/**
 * Collect all attachment images from all groups
 */
export interface AttachmentImage {
  url: string;
  filename: string;
  caption?: string;
  groupName: string;
  itemDescription: string;
}

export function collectAttachmentImages(groups: IQuotationGroup[]): AttachmentImage[] {
  const images: AttachmentImage[] = [];

  for (const group of groups) {
    for (const lineItem of group.lineItems) {
      if (lineItem.selectedImages && lineItem.selectedImages.length > 0) {
        for (const img of lineItem.selectedImages) {
          images.push({
            url: img.url,
            filename: img.filename,
            caption: img.caption,
            groupName: group.name,
            itemDescription: lineItem.description,
          });
        }
      }
    }
  }

  return images;
}

/**
 * Generate quotation number in format QT-YYYYMM-XXXX
 * @param lastNumber - The last quotation number for this company in the current month (e.g., "QT-202602-0042")
 * @returns New quotation number
 */
export function generateQuotationNumber(lastNumber?: string | null): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const prefix = `QT-${year}${month}`;

  if (!lastNumber) {
    return `${prefix}-0001`;
  }

  // Extract the sequence number from the last quotation number
  const match = lastNumber.match(/QT-(\d{6})-(\d{4})/);
  if (!match) {
    return `${prefix}-0001`;
  }

  const lastYearMonth = match[1];
  const lastSequence = parseInt(match[2], 10);

  // If it's a new month, start from 0001
  if (lastYearMonth !== `${year}${month}`) {
    return `${prefix}-0001`;
  }

  // Increment the sequence
  const newSequence = String(lastSequence + 1).padStart(4, "0");
  return `${prefix}-${newSequence}`;
}

/**
 * Get the last quotation number for a company in the current month
 * This is a helper that should be used with database query
 */
export function getQuotationNumberPrefix(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `QT-${year}${month}`;
}

/**
 * Count total line items across all groups
 */
export function countTotalLineItems(groups: IQuotationGroup[]): number {
  return groups.reduce((total, group) => total + group.lineItems.length, 0);
}

/**
 * Validate that a quotation has valid structure
 */
export function validateQuotationStructure(groups: IQuotationGroup[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!groups || groups.length === 0) {
    errors.push("Quotation must have at least 1 group");
    return { valid: false, errors };
  }

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];

    if (!group.name || group.name.trim() === "") {
      errors.push(`Group ${i + 1} must have a name`);
    }

    if (!group.lineItems || group.lineItems.length === 0) {
      errors.push(`Group "${group.name || i + 1}" must have at least 1 line item`);
    }

    for (let j = 0; j < (group.lineItems || []).length; j++) {
      const item = group.lineItems[j];

      if (!item.description || item.description.trim() === "") {
        errors.push(
          `Line item ${j + 1} in group "${group.name || i + 1}" must have a description`
        );
      }

      if (item.quantity <= 0) {
        errors.push(
          `Line item "${item.description || j + 1}" in group "${group.name || i + 1}" must have quantity > 0`
        );
      }

      if (item.unitPrice < 0) {
        errors.push(
          `Line item "${item.description || j + 1}" in group "${group.name || i + 1}" cannot have negative price`
        );
      }

      if (item.selectedImages && item.selectedImages.length > 5) {
        errors.push(
          `Line item "${item.description || j + 1}" in group "${group.name || i + 1}" can have at most 5 images`
        );
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
