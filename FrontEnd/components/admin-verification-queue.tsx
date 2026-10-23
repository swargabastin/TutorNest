'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FileCheck, ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';
import { adminApi, PendingVerificationDocument } from '@/lib/api';

const docTypeLabels: Record<string, string> = {
  GovernmentId: 'Government ID',
  EducationCertificate: 'Education Degree / Certificate',
  PoliceVerification: 'Police Verification',
  AddressProof: 'Address Proof',
};

export function AdminVerificationQueue() {
  const [pendingDocs, setPendingDocs] = useState<PendingVerificationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  const loadPendingQueue = () => {
    setLoading(true);
    adminApi.getPendingVerificationDocuments()
      .then(setPendingDocs)
      .catch((err) => console.error('Failed to load pending verification queue', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPendingQueue();
  }, []);

  const handleReview = async (id: string, approve: boolean, reason?: string) => {
    if (!approve && !reason?.trim()) {
      setError('A rejection reason is required when rejecting a document.');
      return;
    }

    setActioningId(id);
    setError('');

    try {
      await adminApi.reviewVerificationDocument(id, {
        approve,
        rejectionReason: approve ? undefined : reason?.trim(),
      });

      setPendingDocs((prev) => prev.filter((d) => d.id !== id));
      setRejectingId(null);
      setRejectionReason('');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to review document.');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <Card className="border border-[#E2E5DF] bg-white rounded-2xl shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2 text-[#243238]">
            <FileCheck className="h-5 w-5 text-plum-800" />
            Verification Documents Approval Queue
          </CardTitle>
          <p className="text-xs text-slate-500">
            FIFO review queue for tutor ID and qualification verification uploads.
          </p>
        </div>
        <Badge variant="outline" className="bg-plum-50 text-plum-900 border-plum-200 text-xs font-semibold">
          {pendingDocs.length} Pending
        </Badge>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-2.5">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-xs text-slate-500 py-4 text-center">Loading queue…</p>
        ) : pendingDocs.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
            <p className="text-xs font-bold text-[#243238]">All verification documents reviewed!</p>
            <p className="text-[11px] text-slate-400 mt-0.5">New submissions will appear here automatically.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="hidden md:grid grid-cols-5 text-xs font-bold text-slate-400 border-b border-[#E2E5DF] pb-2">
              <span className="col-span-1">Tutor Name</span>
              <span className="col-span-1">Document Type</span>
              <span className="col-span-1">Submitted Date</span>
              <span className="col-span-1">Preview</span>
              <span className="col-span-1 text-right">Actions</span>
            </div>

            {pendingDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col md:grid md:grid-cols-5 items-start md:items-center py-2.5 border-b border-[#E2E5DF] last:border-b-0 gap-2 md:gap-0"
              >
                <div className="col-span-1 font-bold text-xs text-[#243238]">
                  {doc.tutorName}
                </div>

                <div className="col-span-1">
                  <Badge variant="outline" className="text-[10px] bg-plum-50 text-plum-900 border-plum-200">
                    {docTypeLabels[doc.docType] ?? doc.docType}
                  </Badge>
                </div>

                <div className="col-span-1 text-xs text-slate-500">
                  {new Date(doc.createdAt).toLocaleDateString('en-IN')}
                </div>

                <div className="col-span-1">
                  <a
                    href={doc.fileUrl.startsWith('http') ? doc.fileUrl : doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-plum-900 hover:underline font-bold gap-1"
                  >
                    View Document <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="col-span-1 flex flex-col md:items-end w-full md:w-auto">
                  {rejectingId === doc.id ? (
                    <div className="flex flex-col gap-2 w-full max-w-xs">
                      <Input
                        type="text"
                        placeholder="Reason for rejection *"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="text-xs bg-white rounded-lg border-[#E2E5DF] h-8"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1 text-xs h-7 rounded-lg"
                          disabled={actioningId === doc.id}
                          onClick={() => handleReview(doc.id, false, rejectionReason)}
                        >
                          Confirm Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 rounded-lg border-[#E2E5DF]"
                          onClick={() => {
                            setRejectingId(null);
                            setRejectionReason('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-8 px-3 rounded-lg font-semibold"
                        disabled={actioningId === doc.id}
                        onClick={() => handleReview(doc.id, true)}
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs text-rose-700 border-[#E2E5DF] hover:bg-rose-50 h-8 px-3 rounded-lg font-semibold"
                        disabled={actioningId === doc.id}
                        onClick={() => {
                          setRejectingId(doc.id);
                          setRejectionReason('');
                        }}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
