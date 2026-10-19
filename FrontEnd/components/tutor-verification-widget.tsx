'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileCheck, Upload, AlertCircle, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import { tutorsApi, VerificationDocument } from '@/lib/api';

const docTypeLabels: Record<string, string> = {
  GovernmentId: 'Government ID (Aadhaar / Passport / Driving License)',
  EducationCertificate: 'Education Certificate / Degree',
  PoliceVerification: 'Police Verification Certificate',
  AddressProof: 'Address Proof (Utility Bill / Rent Agreement)',
};

export function TutorVerificationWidget() {
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string>('GovernmentId');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadDocuments = () => {
    tutorsApi.getVerificationDocuments()
      .then(setDocuments)
      .catch((err) => console.error('Failed to load verification documents', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const ext = selected.name.split('.').pop()?.toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'webp', 'pdf'].includes(ext || '')) {
      setError('Invalid file type. Only JPG, PNG, WEBP, and PDF files are allowed.');
      setFile(null);
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10 MB limit.');
      setFile(null);
      return;
    }

    setError('');
    setFile(selected);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      await tutorsApi.uploadVerificationDocument(file, selectedDocType);
      setSuccess('Verification document submitted successfully! It is now pending admin review.');
      setFile(null);
      loadDocuments();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 gap-1">
            <CheckCircle className="h-3 w-3" /> Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 gap-1">
            <Clock className="h-3 w-3" /> Pending Review
          </Badge>
        );
    }
  };

  const isVerified = documents.some(d => d.docType === 'GovernmentId' && d.status.toLowerCase() === 'approved');

  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-teal-600" />
            Identity & Qualification Verification
          </CardTitle>
          <p className="text-sm text-gray-500">
            Upload your ID and degree certificates to get the Verified Tutor badge on your profile.
          </p>
        </div>
        <div>
          {isVerified ? (
            <Badge className="bg-teal-600 text-white gap-1 px-3 py-1 text-xs">
              <CheckCircle className="h-3.5 w-3.5" /> Verified Tutor
            </Badge>
          ) : (
            <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200 gap-1 px-3 py-1 text-xs">
              <AlertCircle className="h-3.5 w-3.5" /> Unverified
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Upload Form */}
        <form onSubmit={handleUpload} className="p-4 bg-gray-50 rounded-lg border space-y-4">
          <h4 className="font-medium text-sm text-gray-900">Upload New Document</h4>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="docType" className="text-xs">Document Type</Label>
              <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                <SelectTrigger id="docType" className="bg-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GovernmentId">Government ID (Aadhaar / Passport)</SelectItem>
                  <SelectItem value="EducationCertificate">Degree / Certificate</SelectItem>
                  <SelectItem value="PoliceVerification">Police Verification</SelectItem>
                  <SelectItem value="AddressProof">Address Proof</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileInput" className="text-xs">Select File (JPG, PNG, WEBP, PDF &lt; 10MB)</Label>
              <input
                id="fileInput"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileChange}
                className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer bg-white rounded-md border p-1"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>
          )}
          {success && (
            <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded p-2">{success}</p>
          )}

          <Button type="submit" disabled={uploading || !file} size="sm" className="bg-teal-600 hover:bg-teal-700">
            <Upload className="h-4 w-4 mr-1.5" />
            {uploading ? 'Uploading…' : 'Submit Document'}
          </Button>
        </form>

        {/* Submitted Documents Table */}
        <div>
          <h4 className="font-medium text-sm text-gray-900 mb-3">Submitted Documents</h4>
          {loading ? (
            <p className="text-sm text-gray-500">Loading documents…</p>
          ) : documents.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No verification documents submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border bg-white gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-teal-50 text-teal-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {docTypeLabels[doc.docType] ?? doc.docType}
                      </p>
                      <p className="text-xs text-gray-500">
                        Submitted on {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                      {doc.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1 font-medium">
                          Reason for rejection: {doc.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {getStatusBadge(doc.status)}
                    <a
                      href={doc.fileUrl.startsWith('http') ? doc.fileUrl : doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-teal-600 hover:underline font-medium"
                    >
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
