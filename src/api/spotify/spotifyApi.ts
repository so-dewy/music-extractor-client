import { PlaylistState } from "../../playlists/Playlists";
import { fetchApi } from "../apiUtils";

export const API_BASE_URL = 'http://localhost:8080'

export enum ExportType {
  JSON = "JSON",
  CSV = "CSV",
  XLS = "XLS",
  XLSX = "XLSX"
}

export function getUserInfo() {
  return fetchApi<any>(`${API_BASE_URL}/spotify/user`, {credentials: 'include'});
}

export function isSignedIn() {
  return fetchApi<boolean>(`${API_BASE_URL}/spotify/is-signed-in`, {credentials: 'include'});
}

export function exportPlaylists(exportType: ExportType, selectedPlaylists: (PlaylistState | null)[], selectAll: boolean) {
  const queryParams = new URLSearchParams();

  queryParams.append('exportType', exportType);
  
  if (selectAll) {
    queryParams.append('selectAll', 'true');
  } else {
    let ids = '';
    if (selectedPlaylists) {
      selectedPlaylists.forEach((el, index) => {
        if (!el) return;
        return index === 0 ? ids += el.id : ids += `,${el.id}`;
      });
    } 
    queryParams.append('ids', ids);
  }

  fetch(`${API_BASE_URL}/spotify/user/playlists/export?${queryParams.toString()}`, {credentials: 'include'})
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText)
      }

      const filename = response.headers.get('Content-Disposition')?.split('filename=')[1];
      
      return response.blob().then(blob => {
        const url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = filename || 'playlists.zip';
        a.click();
        window.URL.revokeObjectURL(url);
      });
    })
}

export function getPlaylists(offset: number, limit: number) {
  const queryParams = new URLSearchParams();
  queryParams.append('offset', offset.toString());
  queryParams.append('limit', limit.toString());

  return fetchApi<PlaylistsApiRes>(`${API_BASE_URL}/spotify/user/playlists?${queryParams.toString()}`, {credentials: 'include'});
}

export interface PlaylistsApiRes {
  limit: number;
  items: PlaylistItem[];
  offset: number;
  total: number;
  next?: string;
  previous?: string;
}

export interface PlaylistItem {
  id: string;
  name: string;
  description: string,
  images: any[];
  owner: {
    display_name: string,
    id: string,
  };
  public: boolean;
  tracks: { total: number };
}