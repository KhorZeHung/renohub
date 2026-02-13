import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import type {
  IQuotationClient,
  IQuotationCompanySnapshot,
  IQuotationGroup,
  IQuotationDiscount,
} from "@/lib/models/quotation";
import { AttachmentImage } from "@/lib/quotation-helpers";

// Register fonts (optional - using Helvetica as fallback)
// You can register custom fonts here if needed

// Create styles
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 30,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 60,
    backgroundColor: "#ffffff",
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
    paddingBottom: 15,
  },
  headerLeft: {
    flexDirection: "column",
    maxWidth: "60%",
  },
  logo: {
    width: 120,
    height: 60,
    objectFit: "contain",
    marginBottom: 8,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  companyInfo: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  quotationTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 8,
  },
  quotationNumber: {
    fontSize: 11,
    color: "#374151",
    marginBottom: 4,
  },
  quotationDate: {
    fontSize: 9,
    color: "#6b7280",
  },
  // Client Section
  clientSection: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
  },
  clientTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  clientInfo: {
    fontSize: 10,
    color: "#4b5563",
    marginBottom: 3,
  },
  // Group Section
  groupSection: {
    marginBottom: 16,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 2,
  },
  groupName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#ffffff",
  },
  groupDescription: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 8,
    paddingHorizontal: 4,
    fontStyle: "italic",
  },
  // Table
  table: {
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 6,
    paddingHorizontal: 4,
    minHeight: 28,
  },
  tableRowAlt: {
    backgroundColor: "#fafafa",
  },
  // Table columns
  colNo: {
    width: "5%",
    textAlign: "center",
  },
  colDescription: {
    width: "40%",
    paddingRight: 8,
  },
  colQty: {
    width: "10%",
    textAlign: "center",
  },
  colUnit: {
    width: "10%",
    textAlign: "center",
  },
  colUnitPrice: {
    width: "17%",
    textAlign: "right",
  },
  colAmount: {
    width: "18%",
    textAlign: "right",
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
  },
  tableCellText: {
    fontSize: 9,
    color: "#4b5563",
  },
  // Group subtotal
  groupSubtotal: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 6,
    paddingHorizontal: 4,
    backgroundColor: "#f9fafb",
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
  },
  groupSubtotalLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
    marginRight: 10,
  },
  groupSubtotalValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
    width: "18%",
    textAlign: "right",
  },
  // Totals Section
  totalsSection: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalsBox: {
    width: 250,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 4,
    overflow: "hidden",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  totalsRowLast: {
    borderBottomWidth: 0,
  },
  totalsLabel: {
    fontSize: 10,
    color: "#4b5563",
  },
  totalsValue: {
    fontSize: 10,
    color: "#374151",
    fontWeight: "bold",
  },
  totalsFinal: {
    backgroundColor: "#2563eb",
  },
  totalsFinalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  totalsFinalValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  // Validity
  validitySection: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "#fef3c7",
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#f59e0b",
  },
  validityText: {
    fontSize: 9,
    color: "#92400e",
  },
  // Terms Section
  termsSection: {
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  termsTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  termsText: {
    fontSize: 8,
    color: "#6b7280",
    lineHeight: 1.5,
  },
  // Notes Section
  notesSection: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#f0f9ff",
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0369a1",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 8,
    color: "#0c4a6e",
    lineHeight: 1.4,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
  pageNumber: {
    position: "absolute",
    bottom: 20,
    right: 40,
    fontSize: 8,
    color: "#9ca3af",
  },
  // Attachment
  attachmentPage: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 30,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 60,
    backgroundColor: "#ffffff",
  },
  attachmentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 20,
    textAlign: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
    paddingBottom: 10,
  },
  attachmentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  attachmentItem: {
    width: "48%",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  attachmentImage: {
    width: "100%",
    height: 180,
    objectFit: "contain",
    backgroundColor: "#f9fafb",
  },
  attachmentCaption: {
    padding: 8,
    backgroundColor: "#f3f4f6",
  },
  attachmentItemName: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 2,
  },
  attachmentGroupName: {
    fontSize: 8,
    color: "#6b7280",
  },
});

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format date
function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Props interface
export interface QuotationPDFProps {
  quotationNumber: string;
  quotationDate: Date;
  validUntil: Date;
  client: IQuotationClient;
  company: IQuotationCompanySnapshot;
  groups: IQuotationGroup[];
  subtotal: number;
  discount?: IQuotationDiscount | null;
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  termsAndConditions?: string | null;
  notes?: string | null;
  attachmentImages: AttachmentImage[];
}

// Header Component
function Header({
  company,
  quotationNumber,
  quotationDate,
}: {
  company: IQuotationCompanySnapshot;
  quotationNumber: string;
  quotationDate: Date;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {company.logo && (
          <Image style={styles.logo} src={company.logo} />
        )}
        <Text style={styles.companyName}>{company.name}</Text>
        <Text style={styles.companyInfo}>{company.email}</Text>
        <Text style={styles.companyInfo}>{company.contactNumber}</Text>
        {company.address && (
          <Text style={styles.companyInfo}>{company.address}</Text>
        )}
      </View>
      <View style={styles.headerRight}>
        <Text style={styles.quotationTitle}>QUOTATION</Text>
        <Text style={styles.quotationNumber}>{quotationNumber}</Text>
        <Text style={styles.quotationDate}>Date: {formatDate(quotationDate)}</Text>
      </View>
    </View>
  );
}

// Client Section Component
function ClientSection({ client }: { client: IQuotationClient }) {
  return (
    <View style={styles.clientSection}>
      <Text style={styles.clientTitle}>Bill To:</Text>
      <Text style={styles.clientInfo}>{client.name}</Text>
      <Text style={styles.clientInfo}>{client.contactNumber}</Text>
      {client.email && <Text style={styles.clientInfo}>{client.email}</Text>}
      {client.address && <Text style={styles.clientInfo}>{client.address}</Text>}
    </View>
  );
}

// Table Header Component
function TableHeader() {
  return (
    <View style={styles.tableHeader} wrap={false}>
      <Text style={[styles.colNo, styles.tableHeaderText]}>#</Text>
      <Text style={[styles.colDescription, styles.tableHeaderText]}>Description</Text>
      <Text style={[styles.colQty, styles.tableHeaderText]}>Qty</Text>
      <Text style={[styles.colUnit, styles.tableHeaderText]}>Unit</Text>
      <Text style={[styles.colUnitPrice, styles.tableHeaderText]}>Unit Price</Text>
      <Text style={[styles.colAmount, styles.tableHeaderText]}>Amount</Text>
    </View>
  );
}

// Group Section Component
function GroupSection({ group, isFirst }: { group: IQuotationGroup; isFirst: boolean }) {
  return (
    <View style={styles.groupSection} wrap={true}>
      <View style={styles.groupHeader} wrap={false}>
        <Text style={styles.groupName}>{group.name}</Text>
      </View>
      {group.description && (
        <Text style={styles.groupDescription}>{group.description}</Text>
      )}
      <View style={styles.table}>
        <TableHeader />
        {group.lineItems.map((item, index) => (
          <View
            key={item.id}
            style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
            wrap={false}
          >
            <Text style={[styles.colNo, styles.tableCellText]}>{index + 1}</Text>
            <Text style={[styles.colDescription, styles.tableCellText]}>
              {item.description}
            </Text>
            <Text style={[styles.colQty, styles.tableCellText]}>{item.quantity}</Text>
            <Text style={[styles.colUnit, styles.tableCellText]}>{item.unit}</Text>
            <Text style={[styles.colUnitPrice, styles.tableCellText]}>
              {formatCurrency(item.unitPrice)}
            </Text>
            <Text style={[styles.colAmount, styles.tableCellText]}>
              {formatCurrency(item.amount)}
            </Text>
          </View>
        ))}
        <View style={styles.groupSubtotal} wrap={false}>
          <Text style={styles.groupSubtotalLabel}>Subtotal ({group.name}):</Text>
          <Text style={styles.groupSubtotalValue}>{formatCurrency(group.subtotal)}</Text>
        </View>
      </View>
    </View>
  );
}

// Totals Section Component
function TotalsSection({
  subtotal,
  discount,
  taxableAmount,
  taxRate,
  taxAmount,
  total,
}: {
  subtotal: number;
  discount?: IQuotationDiscount | null;
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}) {
  return (
    <View style={styles.totalsSection}>
      <View style={styles.totalsBox}>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Subtotal</Text>
          <Text style={styles.totalsValue}>{formatCurrency(subtotal)}</Text>
        </View>
        {discount && discount.amount > 0 && (
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>
              Discount ({discount.type === "percentage" ? `${discount.value}%` : "Fixed"})
            </Text>
            <Text style={styles.totalsValue}>-{formatCurrency(discount.amount)}</Text>
          </View>
        )}
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Taxable Amount</Text>
          <Text style={styles.totalsValue}>{formatCurrency(taxableAmount)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Tax ({taxRate}%)</Text>
          <Text style={styles.totalsValue}>{formatCurrency(taxAmount)}</Text>
        </View>
        <View style={[styles.totalsRow, styles.totalsRowLast, styles.totalsFinal]}>
          <Text style={styles.totalsFinalLabel}>Grand Total</Text>
          <Text style={styles.totalsFinalValue}>{formatCurrency(total)}</Text>
        </View>
      </View>
    </View>
  );
}

// Validity Section Component
function ValiditySection({ validUntil }: { validUntil: Date }) {
  return (
    <View style={styles.validitySection}>
      <Text style={styles.validityText}>
        This quotation is valid until {formatDate(validUntil)}
      </Text>
    </View>
  );
}

// Terms Section Component
function TermsSection({ terms }: { terms?: string | null }) {
  if (!terms) return null;

  return (
    <View style={styles.termsSection}>
      <Text style={styles.termsTitle}>Terms & Conditions</Text>
      <Text style={styles.termsText}>{terms}</Text>
    </View>
  );
}

// Notes Section Component
function NotesSection({ notes }: { notes?: string | null }) {
  if (!notes) return null;

  return (
    <View style={styles.notesSection}>
      <Text style={styles.notesTitle}>Notes</Text>
      <Text style={styles.notesText}>{notes}</Text>
    </View>
  );
}

// Attachment Page Component
function AttachmentPage({ images }: { images: AttachmentImage[] }) {
  if (images.length === 0) return null;

  return (
    <Page size="A4" style={styles.attachmentPage}>
      <Text style={styles.attachmentTitle}>Attachment - Product Images</Text>
      <View style={styles.attachmentGrid}>
        {images.map((img, index) => (
          <View key={index} style={styles.attachmentItem} wrap={false}>
            <Image style={styles.attachmentImage} src={img.url} />
            <View style={styles.attachmentCaption}>
              <Text style={styles.attachmentItemName}>{img.itemDescription}</Text>
              <Text style={styles.attachmentGroupName}>{img.groupName}</Text>
              {img.caption && (
                <Text style={[styles.attachmentGroupName, { marginTop: 2 }]}>
                  {img.caption}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>
  );
}

// Main Document Component
export function QuotationPDF({
  quotationNumber,
  quotationDate,
  validUntil,
  client,
  company,
  groups,
  subtotal,
  discount,
  taxableAmount,
  taxRate,
  taxAmount,
  total,
  termsAndConditions,
  notes,
  attachmentImages,
}: QuotationPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Header
          company={company}
          quotationNumber={quotationNumber}
          quotationDate={quotationDate}
        />

        {/* Client Info */}
        <ClientSection client={client} />

        {/* Groups with Line Items */}
        {groups.map((group, index) => (
          <GroupSection key={group.id} group={group} isFirst={index === 0} />
        ))}

        {/* Totals */}
        <TotalsSection
          subtotal={subtotal}
          discount={discount}
          taxableAmount={taxableAmount}
          taxRate={taxRate}
          taxAmount={taxAmount}
          total={total}
        />

        {/* Validity */}
        <ValiditySection validUntil={validUntil} />

        {/* Notes */}
        <NotesSection notes={notes} />

        {/* Terms & Conditions */}
        <TermsSection terms={termsAndConditions} />

        {/* Footer */}
        <Text style={styles.footer}>
          Thank you for your business!
        </Text>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>

      {/* Attachment Page(s) */}
      {attachmentImages.length > 0 && <AttachmentPage images={attachmentImages} />}
    </Document>
  );
}

export default QuotationPDF;
