"use client"

import React, { useState, ChangeEvent, useCallback } from "react"
import { Check, Upload, FileText, Truck, ShoppingCart, AlertCircle, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useTesseract } from "@/hooks/useTesseract";
import { SuccessModal } from "@/components/SuccessModal";

interface DocumentStatus {
  uploaded: boolean;
  fileName?: string;
  progress?: number;
  required?: boolean;
  isReadable?: boolean;
  isProcessing?: boolean;
  error?: string;
}

type SupplierType = 'local' | 'foreign'

interface DocumentType {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  required: boolean
}

export default function InvoiceVerification() {
  const [supplierType, setSupplierType] = useState<SupplierType>('local')
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState("")
  const [isValidPO, setIsValidPO] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Document types for local suppliers
  const localDocuments: Record<string, DocumentType> = {
    purchaseOrder: { id: 'purchaseOrder', label: 'Bon de commande', icon: ShoppingCart, required: true },
    invoice: { id: 'invoice', label: 'Facture', icon: FileText, required: true },
    deliveryReceipt: { id: 'deliveryReceipt', label: 'Bon de livraison', icon: Truck, required: true },
    receipt: { id: 'receipt', label: 'Procès-verbal de réception', icon: Check, required: true }
  }

  // Document types for foreign suppliers
  const foreignDocuments: Record<string, DocumentType> = {
    purchaseOrder: { id: 'purchaseOrder', label: 'Bon de commande', icon: ShoppingCart, required: true },
    invoice: { id: 'invoice', label: 'Facture/Proforma', icon: FileText, required: true },
    deliveryReceipt: { id: 'deliveryReceipt', label: 'Bon de livraison', icon: Truck, required: true },
    receipt: { id: 'receipt', label: 'Procès-verbal de réception', icon: Check, required: true },
    customsDeclaration: { id: 'customsDeclaration', label: 'Déclaration d\'importation (DI)', icon: AlertCircle, required: true },
    domiciliation: { id: 'domiciliation', label: 'Attestation de domiciliation', icon: AlertCircle, required: true },
    serviceContract: { id: 'serviceContract', label: 'Contrat de service', icon: AlertCircle, required: true }
  }

  // Get current documents based on supplier type
  const currentDocuments = supplierType === 'local' ? localDocuments : foreignDocuments
  
  // Initialize documents state
  const [documents, setDocuments] = useState<Record<string, DocumentStatus>>(
    Object.fromEntries(
      Object.entries({
        ...localDocuments,
        ...foreignDocuments
      }).map(([key, doc]) => [key, { 
        uploaded: false, 
        required: doc.required 
      }])
    )
  )

  const handlePOChange = (value: string) => {
    setPurchaseOrderNumber(value)
    // Simple validation - check if it's not empty and has at least 3 characters
    setIsValidPO(value.length >= 3)
  }

  const { checkReadability, isLoading: isTesseractLoading } = useTesseract();

  const handleFileUpload = async (documentType: string, file: File) => {
    // Set initial state
    setDocuments((prev) => ({
      ...prev,
      [documentType]: { 
        ...prev[documentType],
        uploaded: false, 
        fileName: file.name, 
        progress: 0,
        isProcessing: true,
        error: undefined,
        isReadable: undefined
      },
    }));

    try {
      // Check document readability
      const { isReadable, error } = await checkReadability(file);
      
      // Update document status with readability result
      setDocuments((prev) => ({
        ...prev,
        [documentType]: {
          ...prev[documentType],
          isReadable,
          error,
          isProcessing: isTesseractLoading,
          uploaded: isReadable,
          progress: isReadable ? 100 : 0
        },
      }));
      
      // If document is not readable, stop here
      if (!isReadable) return;
      
      // Simulate file upload progress (replace with actual upload logic)
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        setDocuments((prev) => ({
          ...prev,
          [documentType]: { 
            ...prev[documentType],
            progress,
            fileName: file.name,
            uploaded: progress >= 100,
            isProcessing: progress < 100
          },
        }));

        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 200);
      
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setDocuments((prev) => ({
        ...prev,
        [documentType]: {
          ...prev[documentType],
          isProcessing: false,
          error: `Erreur lors du traitement du fichier: ${errorMessage}`,
          isReadable: false
        },
      }));
    }
  }

  const allDocumentsUploaded = (Object.entries(documents) as [string, DocumentStatus][])
    .filter(([key]) => currentDocuments[key]?.required)
    .every(([_, doc]) => doc.uploaded && doc.isReadable)
  
  const canSubmit = isValidPO && allDocumentsUploaded

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPO) return;
    
    // Check if all required documents are uploaded and readable
    const allDocumentsValid = Object.values(currentDocuments)
      .filter(doc => doc.required)
      .every(doc => documents[doc.id]?.uploaded && documents[doc.id]?.isReadable);
    
    if (!allDocumentsValid) {
      alert('Veuillez télécharger tous les documents requis et vous assurer qu\'ils sont lisibles.');
      return;
    }
    
    // Here you would typically send the data to your backend
    console.log('Submitting form with documents:', documents);
    
    // Show loading state
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 1500);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    // Optionally reset the form here if needed
    // resetForm();
  };

  const DocumentUploadArea = ({
    documentType,
    status,
  }: {
    documentType: DocumentType;
    status: DocumentStatus;
  }) => {
    const { id, label, icon: Icon, required } = documentType
    
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(id, file);
      }
    }, [id]);

    const handleRetry = useCallback(() => {
      // Reset the document status to allow re-upload
      setDocuments(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          uploaded: false,
          isReadable: undefined,
          error: undefined,
          fileName: undefined,
          progress: undefined
        }
      }));
    }, [id]);
    
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-gray-500" />
          <h3 className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </h3>
          <div className="ml-auto flex items-center gap-2">
            {status.isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            ) : status.uploaded && status.isReadable ? (
              <span className="flex items-center text-sm text-green-600">
                <Check className="mr-1 h-4 w-4" />
                Document valide
              </span>
            ) : status.error ? (
              <span className="flex items-center text-sm text-amber-600">
                <AlertTriangle className="mr-1 h-4 w-4" />
                Problème détecté
              </span>
            ) : (
              <span className="text-sm text-gray-500">En attente</span>
            )}
          </div>
        </div>

        {!status.uploaded && !status.isProcessing && status.progress === undefined && (
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-blue-300 hover:bg-blue-50/50 transition-colors cursor-pointer"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".pdf,.jpg,.jpeg,.png";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleFileUpload(id, file);
              };
              input.click();
            }}
          >
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Cliquez pour télécharger ou glissez-déposez</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG jusqu'à 10MB</p>
          </div>
        )}

        {status.isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{status.fileName || 'Traitement en cours...'}</span>
              <span className="text-blue-600">{status.progress || 0}%</span>
            </div>
            <Progress value={status.progress || 0} className="h-2" />
          </div>
        )}

        {status.error && (
          <div className="space-y-3">
            <Alert variant="destructive" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {status.error}
              </AlertDescription>
            </Alert>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                className="flex items-center gap-1"
              >
                <Upload className="h-3.5 w-3.5" />
                Réessayer
              </Button>
            </div>
          </div>
        )}
        
        {status.uploaded && status.isReadable && (
          <div className="flex items-center justify-between gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-700">{status.fileName}</p>
                <p className="text-xs text-green-600">Document vérifié et lisible</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRetry}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Remplacer
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="font-bold text-blue-600">InVerif</div>
              <div className="text-muted-foreground">/</div>
              <CardTitle>Vérification de facture</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Type de fournisseur</h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => setSupplierType('local')}
                  className={`px-4 py-2 rounded-md ${
                    supplierType === 'local' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Fournisseur local
                </button>
                <button
                  onClick={() => setSupplierType('foreign')}
                  className={`px-4 py-2 rounded-md ${
                    supplierType === 'foreign' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Fournisseur étranger
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Informations de la commande</h3>
              <div className="space-y-2">
                <Label htmlFor="po-number">Numéro de commande</Label>
                <div className="relative">
                  <Input
                    id="po-number"
                    placeholder="Entrez le numéro de commande"
                    value={purchaseOrderNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePOChange(e.target.value)}
                    className={`pr-10 ${isValidPO ? 'border-green-300 focus:border-green-500' : ''}`}
                  />
                  {isValidPO ? (
                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
                  ) : purchaseOrderNumber ? (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  ) : null}
                </div>
                {purchaseOrderNumber && !isValidPO && (
                  <p className="text-sm text-red-600">
                    Veuillez entrer un numéro de commande valide (minimum 3 caractères)
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Documents requis</h3>
              <div className="space-y-6">
                {Object.entries(currentDocuments).map(([key, docType]) => (
                  <DocumentUploadArea
                    key={key}
                    documentType={docType}
                    status={documents[key] || { uploaded: false }}
                  />
                ))}
              </div>
            </div>

            {/* Progress Summary */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${isValidPO ? "bg-green-500" : "bg-gray-300"}`} />
                    <span className="text-sm">Numéro de commande vérifié</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${allDocumentsUploaded ? "bg-green-500" : "bg-gray-300"}`} />
                    <span className="text-sm">Tous les documents téléchargés</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              className="w-full h-12 text-base"
              disabled={!canSubmit || isSubmitting}
              type="submit"
            >
              {canSubmit && !isSubmitting ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Continuer vers la révision
                </>
              ) : isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              ) : (
                "Complétez tous les champs requis pour continuer"
              )}
            </Button>

            {!canSubmit && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {!isValidPO && !allDocumentsUploaded
                    ? "Veuillez vérifier votre numéro de commande et télécharger tous les documents requis"
                    : !isValidPO
                      ? "Veuillez vérifier votre numéro de commande"
                      : "Veuillez télécharger tous les documents requis"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={handleModalClose} 
      />
    </form>
  )
}
