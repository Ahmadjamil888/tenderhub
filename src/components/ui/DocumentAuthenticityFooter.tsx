/**
 * DocumentAuthenticityFooter
 * Shared sub-component appended to every procurement document template.
 * Contains: document serial number, QR code placeholder, audit trail number,
 * digital signature list for committee/approving authorities,
 * and relationship manager contact block.
 */
import { QrCode, Hash, Shield, User, Phone, Mail } from "lucide-react";

export type DigitalSigner = {
  name: string;
  role: string;
  signedAt?: string;
  status?: "signed" | "pending";
};

export type RelationshipManager = {
  name: string;
  role: string;
  phone?: string;
  email?: string;
};

type Props = {
  serialNumber: string;
  auditTrailNumber: string;
  signers?: DigitalSigner[];
  relationshipManager?: RelationshipManager;
  reportClassification?: string;
  reportVersion?: string;
  currency?: string;
  className?: string;
};

export function DocumentAuthenticityFooter({
  serialNumber,
  auditTrailNumber,
  signers = [],
  relationshipManager,
  reportClassification = "OFFICIAL",
  reportVersion = "1.0",
  currency = "USD",
  className = "",
}: Props) {
  return (
    <div className={`border-t-2 border-[#1a6b3a] mt-8 pt-6 space-y-6 print:mt-4 ${className}`}>
      {/* Document meta row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Serial number */}
        <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded p-3">
          <Hash className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Document Serial No.</p>
            <p className="text-sm font-mono font-bold text-gray-900">{serialNumber}</p>
            <p className="text-[10px] text-gray-400">Version {reportVersion} · {reportClassification}</p>
          </div>
        </div>

        {/* QR code placeholder */}
        <div className="flex items-center justify-center gap-3 bg-gray-50 border border-gray-200 rounded p-3">
          <div className="h-16 w-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center bg-white">
            <QrCode className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">QR Verification</p>
            <p className="text-xs text-gray-600 max-w-[120px]">Scan to verify document authenticity on the e-GP portal</p>
          </div>
        </div>

        {/* Audit trail */}
        <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded p-3">
          <Shield className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Audit Trail No.</p>
            <p className="text-sm font-mono font-bold text-gray-900">{auditTrailNumber}</p>
            <p className="text-[10px] text-gray-400">Blockchain-secured · Immutable</p>
          </div>
        </div>
      </div>

      {/* Digital signatures */}
      {signers.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Digital Signatures</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {signers.map((signer, i) => (
              <div key={i} className="border border-gray-200 rounded p-3 bg-white">
                <div className="flex items-center gap-1.5 mb-2">
                  <User className="h-3 w-3 text-gray-400" />
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{signer.role}</p>
                </div>
                <p className="text-xs font-medium text-gray-800">{signer.name}</p>
                {/* signature line */}
                <div className={`mt-2 border-b-2 ${signer.status === "signed" ? "border-emerald-600" : "border-dashed border-gray-300"} pb-1`}>
                  {signer.status === "signed" && (
                    <p className="text-[10px] font-mono text-emerald-700 italic">✓ Digitally Signed</p>
                  )}
                  {signer.status !== "signed" && (
                    <p className="text-[10px] text-gray-400 italic">Pending signature</p>
                  )}
                </div>
                {signer.signedAt && (
                  <p className="text-[9px] text-gray-400 mt-1">{signer.signedAt}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Relationship manager */}
      {relationshipManager && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded p-3">
          <User className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600 mb-1">Ministry Contact / Relationship Manager</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              <div>
                <p className="text-xs font-semibold text-gray-800">{relationshipManager.name}</p>
                <p className="text-[10px] text-gray-600">{relationshipManager.role}</p>
              </div>
              {relationshipManager.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3 text-gray-400" />
                  <p className="text-xs text-gray-700">{relationshipManager.phone}</p>
                </div>
              )}
              {relationshipManager.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3 text-gray-400" />
                  <p className="text-xs text-gray-700">{relationshipManager.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer note */}
      <p className="text-[9px] text-gray-400 text-center border-t pt-2">
        Currency: {currency} · This document is system-generated and digitally authenticated.
        Any alteration renders it invalid. Verify at zeps.gov.zw using the QR code above.
      </p>
    </div>
  );
}
