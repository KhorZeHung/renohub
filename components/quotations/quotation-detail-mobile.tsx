"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  FileText,
  User,
  Package,
  Calculator,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
  XCircle,
  Eye,
  Send,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { QuotationDetailResponse } from "@/types";

const tabs = [
  { id: "quotation", label: "Quote", icon: FileText },
  { id: "client", label: "Client", icon: User },
  { id: "content", label: "Items", icon: Package },
  { id: "summary", label: "Summary", icon: Calculator },
] as const;

type TabId = (typeof tabs)[number]["id"];

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  viewed: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  expired: "bg-orange-100 text-orange-700",
};

const statusIcons: Record<string, React.ReactNode> = {
  draft: <FileText className="h-4 w-4" />,
  sent: <Send className="h-4 w-4" />,
  viewed: <Eye className="h-4 w-4" />,
  accepted: <CheckCircle2 className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
  expired: <Clock className="h-4 w-4" />,
};

interface QuotationDetailMobileProps {
  quotation: QuotationDetailResponse;
}

export function QuotationDetailMobile({ quotation }: QuotationDetailMobileProps) {
  const [activeTab, setActiveTab] = useState<TabId>("quotation");
  const [prevTab, setPrevTab] = useState<TabId>("quotation");
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Track scroll direction to show/hide tab bar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsTabBarVisible(false);
      } else {
        setIsTabBarVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleTabChange = useCallback((newTab: TabId) => {
    setPrevTab(activeTab);
    setActiveTab(newTab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  const tabIndex = tabs.findIndex((t) => t.id === activeTab);
  const prevTabIndex = tabs.findIndex((t) => t.id === prevTab);
  const slideDirection = tabIndex > prevTabIndex ? "left" : "right";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-SG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency: "SGD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="pb-20">
      {/* Content area with sliding transition */}
      <div ref={scrollContainerRef} className="overflow-hidden">
        <div
          key={activeTab}
          className={`animate-slide-${slideDirection}`}
          style={{
            animation:
              activeTab !== prevTab
                ? `slide-in-from-${slideDirection} 0.3s ease-out`
                : undefined,
          }}
        >
          {activeTab === "quotation" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quotation Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium text-muted-foreground">
                      Status
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium uppercase flex items-center gap-1.5 ${
                        statusColors[quotation.status]
                      }`}
                    >
                      {statusIcons[quotation.status]}
                      {quotation.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium text-muted-foreground">
                      Quotation #
                    </span>
                    <span className="font-medium">
                      {quotation.quotationNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium text-muted-foreground">
                      Created Date
                    </span>
                    <span>{formatDate(quotation.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium text-muted-foreground">
                      Valid Until
                    </span>
                    <span>{formatDate(quotation.validUntil)}</span>
                  </div>
                </CardContent>
              </Card>

              {quotation.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {quotation.notes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "client" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Client Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Name
                      </p>
                      <p>{quotation.client.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Contact Number
                      </p>
                      <p>{quotation.client.contactNumber}</p>
                    </div>
                  </div>
                  {quotation.client.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Email
                        </p>
                        <p>{quotation.client.email}</p>
                      </div>
                    </div>
                  )}
                  {quotation.client.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Address
                        </p>
                        <p>{quotation.client.address}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "content" && (
            <div className="space-y-4">
              {quotation.groups.map((group) => (
                <Card key={group.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    {group.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {group.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table className="min-w-[600px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40%]">Description</TableHead>
                            <TableHead className="w-[15%] text-center">Qty</TableHead>
                            <TableHead className="w-[15%] text-center">Unit</TableHead>
                            <TableHead className="w-[15%] text-right">Price</TableHead>
                            <TableHead className="w-[15%] text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.lineItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="align-top">
                                <span className="whitespace-pre-wrap">
                                  {item.description}
                                </span>
                                {item.selectedImages &&
                                  item.selectedImages.length > 0 && (
                                    <div className="flex gap-2 mt-2">
                                      <Badge variant="secondary" className="text-xs">
                                        <ImageIcon className="h-3 w-3 mr-1" />
                                        {item.selectedImages.length} Image
                                        {item.selectedImages.length > 1 ? "s" : ""}
                                      </Badge>
                                    </div>
                                  )}
                              </TableCell>
                              <TableCell className="text-center align-top">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="text-center align-top">
                                {item.unit}
                              </TableCell>
                              <TableCell className="text-right align-top">
                                {formatCurrency(item.unitPrice)}
                              </TableCell>
                              <TableCell className="text-right align-top font-medium">
                                {formatCurrency(item.amount)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "summary" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(quotation.subtotal)}</span>
                  </div>
                  
                  {quotation.discount && (
                    <div className="flex justify-between items-center text-sm text-green-600">
                      <span>
                        Discount{" "}
                        {quotation.discount.type === "percentage" &&
                          `(${quotation.discount.value}%)`}
                      </span>
                      <span>- {formatCurrency(quotation.discount.amount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm">
                    <span>Taxable Amount</span>
                    <span>{formatCurrency(quotation.taxableAmount)}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span>GST ({quotation.taxRate}%)</span>
                    <span>{formatCurrency(quotation.taxAmount)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(quotation.total)}</span>
                  </div>
                </CardContent>
              </Card>

              {quotation.termsAndConditions && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Terms & Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap pl-4 border-l-2 border-muted">
                      {quotation.termsAndConditions}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom tab bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-background border-t z-50 transition-transform duration-300 ${
          isTabBarVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <nav className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                <span className={`text-xs ${isActive ? "font-semibold" : ""}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
