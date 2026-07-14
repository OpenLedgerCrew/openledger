// export interface PaymentDetailProps {
//   programmeId: string;
//   referenceId: string;
// }

/**
 * Section 6.2 — the payment detail view: reference ID, amount, status, timestamps, and the
 * transaction hash (item 2); both legs where the data exists — funds sent and cash confirmed
 * delivered — each honestly labelled (item 3); zero PII (item 4, section 4.3).
 */
// export function PaymentDetail(_props: PaymentDetailProps) {
//   return <main data-testid="not-implemented" />;
// }



// import React, { useState } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// import { Card, CardContent } from "@/components/ui/card";
// import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
// import { AlertTriangle, CheckCircle2, Circle, Filter, Download } from "lucide-react";

// const PAYMENTS = [
//   { ref: "TUR-8472", amount: "5,000 KES", status: "delivered", sent: "12 Oct 2025", delivered: "12 Oct 2025" },
//   { ref: "TUR-8474", amount: "5,000 KES", status: "awaiting", sent: "13 Oct 2025", delivered: "–" },
//   { ref: "TUR-8476", amount: "5,000 KES", status: "ready", sent: "–", delivered: "–" },
//   { ref: "TUR-8478", amount: "5,000 KES", status: "delivered", sent: "11 Oct 2025", delivered: "11 Oct 2025" },
// ];

// const STATUS_CONFIG = {
//   delivered: { label: "Delivered", icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50" },
//   awaiting: { label: "Awaiting", icon: AlertTriangle, className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50" },
//   ready: { label: "Ready", icon: Circle, className: "bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-50" },
// };

// function StatusBadge({ status }) {
//   const config = STATUS_CONFIG[status];
//   const Icon = config.icon;
//   return (
//     <Badge variant="outline" className={`gap-1.5 font-medium ${config.className}`}>
//       <Icon size={13} strokeWidth={2.5} />
//       {config.label}
//     </Badge>
//   );
// }

// function StatCard({ label, value, valueClassName = "", trailingIcon }) {
//   return (
//     <Card className="border-amber-200/70 bg-amber-50/70 shadow-none">
//       <CardContent className="px-4 py-3">
//         <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">{label}</p>
//         <p className={`mt-1 flex items-center gap-1.5 text-lg font-semibold text-stone-800 ${valueClassName}`}>
//           {value}
//           {trailingIcon}
//         </p>
//       </CardContent>
//     </Card>
//   );
// }

// export default function OpenLedgerPaymentModal() {
//   const [open, setOpen] = useState(true);
//   const [page, setPage] = useState(1);

//   return (
//     <div className="min-h-[600px] bg-stone-200 p-6">
//       {/* dimmed background page, purely for context */}
//       <div className="pointer-events-none select-none opacity-40 blur-[1px]">
//         <div className="mx-auto max-w-4xl">
//           <div className="flex items-center justify-between py-3">
//             <span className="text-sm font-semibold text-stone-700">OpenLedger</span>
//             <div className="flex gap-6 text-sm text-stone-500">
//               <span>Programmes</span>
//               <span>Donations</span>
//               <span>Audit Logs</span>
//               <span>Impact</span>
//             </div>
//             <Badge className="bg-emerald-800 text-white hover:bg-emerald-800">Sign in</Badge>
//           </div>
//         </div>
//       </div>

//       {!open && (
//         <div className="flex justify-center pt-16">
//           <Button onClick={() => setOpen(true)}>Reopen programme detail</Button>
//         </div>
//       )}

//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogContent className="max-w-2xl gap-0 p-0">
//           <DialogHeader className="px-6 pt-6 text-left">
//             <DialogTitle className="text-base font-semibold text-stone-900">
//               Turkana Livelihoods Programme
//             </DialogTitle>
//             <DialogDescription className="text-sm text-stone-500">Q3 2025 – Q2 2026</DialogDescription>
//           </DialogHeader>

//           {/* stat cards */}
//           <div className="grid grid-cols-3 gap-3 px-6 pt-5">
//             <StatCard label="Total Disbursed KES" value="5,240,000" />
//             <StatCard label="Payments" value="1,247" />
//             <StatCard
//               label="Delivery Rate"
//               value="96.3%"
//               valueClassName="text-emerald-700"
//               trailingIcon={<CheckCircle2 size={16} className="text-emerald-600" strokeWidth={2.5} />}
//             />
//           </div>

//           {/* how to read this page */}
//           <Alert className="mx-6 mt-5 w-auto border-l-4 border-l-amber-400 border-y-0 border-r-0 bg-amber-50">
//             <AlertTriangle className="text-amber-500" strokeWidth={2} />
//             <AlertTitle className="text-sm font-semibold text-stone-800">How to read this page</AlertTitle>
//             <AlertDescription className="text-sm leading-snug text-stone-600">
//               All records below are pulled directly from the SAPCONE ledger. Audit trails for each
//               transaction are cryptographically verified for donor transparency.
//             </AlertDescription>
//           </Alert>

//           {/* payments table */}
//           <div className="mt-5 flex items-center justify-between px-6">
//             <h3 className="text-sm font-semibold text-stone-800">All Payments</h3>
//             <Button variant="outline" size="sm" className="gap-1.5 text-xs">
//               <Filter size={13} />
//               Filter
//             </Button>
//           </div>

//           <div className="mt-3">
//             <Table>
//               <TableHeader>
//                 <TableRow className="bg-stone-50/60 hover:bg-stone-50/60">
//                   <TableHead className="px-6">Reference</TableHead>
//                   <TableHead>Amount</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Sent</TableHead>
//                   <TableHead className="px-6">Delivered</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {PAYMENTS.map((p) => (
//                   <TableRow key={p.ref}>
//                     <TableCell className="px-6 font-semibold text-stone-800">{p.ref}</TableCell>
//                     <TableCell className="text-stone-700">{p.amount}</TableCell>
//                     <TableCell>
//                       <StatusBadge status={p.status} />
//                     </TableCell>
//                     <TableCell className="text-stone-500">{p.sent}</TableCell>
//                     <TableCell className="px-6 text-stone-500">{p.delivered}</TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>

//           {/* footer / pagination */}
//           <div className="flex items-center justify-between border-t border-stone-100 px-6 py-4">
//             <p className="text-xs text-stone-500">Showing 1–50 of 1,247 payments</p>
//             <div className="flex items-center gap-3 text-xs font-medium">
//               <button
//                 disabled={page === 1}
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//                 className="text-stone-400 disabled:opacity-40 enabled:hover:text-stone-600"
//               >
//                 Prev
//               </button>
//               {[1, 2, 3].map((n) => (
//                 <button
//                   key={n}
//                   onClick={() => setPage(n)}
//                   className={`flex h-5 w-5 items-center justify-center rounded ${
//                     page === n ? "bg-emerald-800 text-white" : "text-emerald-800 hover:bg-emerald-50"
//                   }`}
//                 >
//                   {n}
//                 </button>
//               ))}
//               <button onClick={() => setPage((p) => Math.min(3, p + 1))} className="text-emerald-800 hover:text-emerald-900">
//                 Next
//               </button>
//             </div>
//             <Button size="sm" className="gap-1.5 bg-emerald-800 text-xs font-semibold hover:bg-emerald-900">
//               Export PDF
//               <Download size={13} />
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
