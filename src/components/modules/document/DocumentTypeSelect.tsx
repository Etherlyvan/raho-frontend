import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { DocumentType } from "@/types";

const DOCUMENT_LABELS: Record<DocumentType, string> = {
  IDENTITAS:      "Dokumen Identitas (KTP/KK)",
  FOTO_PASIEN:    "Foto Pasien",
  KARTU_ASURANSI: "Kartu Asuransi",
  RESEP_DOKTER:   "Resep Dokter",
  HASIL_LAB:      "Hasil Laboratorium",
  LAINNYA:        "Lainnya",
};

interface Props {
  value:    DocumentType | "";
  onChange: (value: DocumentType) => void;
}

export function DocumentTypeSelect({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as DocumentType)}>
      <SelectTrigger>
        <SelectValue placeholder="Pilih jenis dokumen" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(DOCUMENT_LABELS).map(([key, label]) => (
          <SelectItem key={key} value={key}>{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
