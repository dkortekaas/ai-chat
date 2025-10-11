import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const fetchDocuments = async (filters?: any) => {
  // Mock implementation - replace with actual API call
  return { data: [], pagination: { totalPages: 1, totalItems: 0 } }
}

const fetchDocument = async (id: string) => {
  // Mock implementation - replace with actual API call
  return { id, name: '', type: '', status: '', chunksCount: 0, createdAt: '' }
}

const uploadDocument = async (file: File) => {
  // Mock implementation - replace with actual API call
  return { id: '1', name: file.name }
}

const deleteDocument = async (id: string) => {
  // Mock implementation - replace with actual API call
  return { id }
}

export function useDocuments(filters?: any) {
  return useQuery({
    queryKey: ['documents', filters],
    queryFn: () => fetchDocuments(filters),
  })
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => fetchDocument(id),
    enabled: !!id,
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (file: File) => uploadDocument(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}