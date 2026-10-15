import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Separator } from "./separator";
import { User, Calendar, Clock, MapPin, FileText, MessageSquare, Paperclip } from "lucide-react";

type Approval = {
  name: string;
  position: string;
  department: string;
  role: string;
  authority: string;
  dateTime: string;
  signature?: string;
};

type ApprovalSignatureBlockProps = {
  reviewedBy?: Approval;
  approvedBy?: Approval;
  authorizedBy?: Approval;
  createdBy?: {
    name: string;
    date: string;
    time: string;
  };
  attachments?: Array<{ name: string; type: string }>;
  resolutions?: Array<{ name: string; date: string }>;
  minutes?: Array<{ name: string; date: string }>;
  showComments?: boolean;
  className?: string;
};

export function ApprovalSignatureBlock({
  reviewedBy,
  approvedBy,
  authorizedBy,
  createdBy,
  attachments = [],
  resolutions = [],
  minutes = [],
  showComments = true,
  className = ""
}: ApprovalSignatureBlockProps) {
  const renderApproval = (label: string, approval?: Approval) => {
    if (!approval) return null;
    
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-slate-700">{label}</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-3 w-3 text-slate-400" />
            <span className="text-slate-600">{approval.name}</span>
          </div>
          <div className="text-slate-600">{approval.position}</div>
          <div className="text-slate-600">{approval.department}</div>
          <div className="text-slate-600">{approval.role}</div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {approval.authority}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Calendar className="h-3 w-3" />
            <span className="text-xs">{approval.dateTime}</span>
          </div>
        </div>
        {approval.signature && (
          <div className="mt-2 rounded border bg-slate-50 p-2">
            <div className="text-xs text-slate-500 mb-1">Electronic Signature</div>
            <div className="font-signature text-slate-700 italic">{approval.signature}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={`mt-4 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Approval & Signature Block</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Approval Signatures */}
        <div className="grid gap-4 md:grid-cols-3">
          {renderApproval("Reviewed by", reviewedBy)}
          {renderApproval("Approved by", approvedBy)}
          {renderApproval("Authorized by", authorizedBy)}
        </div>

        <Separator />

        {/* Created By Metadata */}
        {createdBy && (
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <User className="h-3 w-3" />
              <span>Created by: {createdBy.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>{createdBy.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>{createdBy.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              <span>Harare, Zimbabwe</span>
            </div>
          </div>
        )}

        {/* Attachments, Resolutions, Minutes */}
        {(attachments.length > 0 || resolutions.length > 0 || minutes.length > 0) && (
          <>
            <Separator />
            <div className="grid gap-3 md:grid-cols-3">
              {attachments.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Paperclip className="h-4 w-4" />
                    Attachments ({attachments.length})
                  </div>
                  {attachments.map((att, idx) => (
                    <div key={idx} className="text-xs text-slate-600 pl-6">
                      • {att.name}
                    </div>
                  ))}
                </div>
              )}
              {resolutions.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <FileText className="h-4 w-4" />
                    Resolutions ({resolutions.length})
                  </div>
                  {resolutions.map((res, idx) => (
                    <div key={idx} className="text-xs text-slate-600 pl-6">
                      • {res.name} ({res.date})
                    </div>
                  ))}
                </div>
              )}
              {minutes.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <FileText className="h-4 w-4" />
                    Minutes ({minutes.length})
                  </div>
                  {minutes.map((min, idx) => (
                    <div key={idx} className="text-xs text-slate-600 pl-6">
                      • {min.name} ({min.date})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Comments Thread */}
        {showComments && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <MessageSquare className="h-4 w-4" />
                Comments & Discussion
              </div>
              <div className="rounded border bg-slate-50 p-3 text-sm text-slate-600">
                <div className="text-xs text-slate-400 italic">No comments yet</div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
