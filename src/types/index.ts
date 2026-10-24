export type UserRole = 'organizer' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
}

export type EventStatus = 'agendado' | 'cancelado' | 'finalizado';

export type AuditoriumStatus = 'active' | 'inactive';

export interface Auditorium {
  id: number;
  name: string;
  capacity: number;
  location: string;
  resources: string[];
  status: AuditoriumStatus;
  imageUrl: string;
  description: string;
  createdAt: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  status: EventStatus;
  auditoriumId: number;
  auditoriumName: string;
  organizerId: number;
  organizerName: string;
  bannerUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
}

export interface MaintenanceBlock {
  id: number;
  auditoriumId: number;
  startAt: string;
  endAt: string;
  reason: string;
  createdBy: number;
  createdAt: string;
}

export interface AvailabilityFilters {
  date: string;
  startTime: string;
  endTime: string;
  minCapacity: number;
}

export type AvailabilityStatus = 'available' | 'occupied' | 'blocked' | 'inactive';

export interface AuditoriumAvailability {
  auditoriumId: number;
  status: AvailabilityStatus;
  conflictingEventId?: number;
  maintenanceBlockId?: number;
}

export interface EventDraft {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  auditoriumId: number;
  bannerUrl?: string | null;
}

export interface AuditoriumDraft {
  name: string;
  capacity: number;
  location: string;
  resources: string[];
  status: AuditoriumStatus;
  imageUrl: string;
  description: string;
}

export interface MaintenanceBlockDraft {
  auditoriumId: number;
  startAt: string;
  endAt: string;
  reason: string;
}

export type BannerUploadStatus = 'idle' | 'uploading' | 'uploaded' | 'error';

export interface BannerUpload {
  fileName: string;
  fileSize: number;
  contentType: string;
  progress: number;
  status: BannerUploadStatus;
  previewUrl: string | null;
  bannerUrl: string | null;
  error?: string;
}

export interface OccupancyReportItem {
  auditoriumId: number;
  auditoriumName: string;
  eventCount: number;
  occupancyRate: number;
}

export interface OccupancyReport {
  totalEvents: number;
  averageOccupancyRate: number;
  generatedAt: string;
  auditoriums: OccupancyReportItem[];
}

export interface ApiAuditorium {
  id: number;
  nome: string;
  capacidade: number;
  localizacao: string;
  recursos: string | null;
  criado_em: string;
}

export interface ApiEvent {
  id: number;
  titulo: string;
  descricao: string | null;
  data_inicio: string;
  data_fim: string;
  status: EventStatus;
  auditorio_id: number;
  criado_em: string;
  auditorio_nome?: string;
}

export interface ApiCreateEventRequest {
  titulo: string;
  descricao?: string | null;
  data_inicio: string;
  data_fim: string;
  auditorio_id: number;
}

export interface ApiCreateAuditoriumRequest {
  nome: string;
  capacidade: number;
  localizacao: string;
  recursos?: string | null;
}