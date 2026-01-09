import { apiClient } from './client'

export interface Announcement {
  id: string // UUID
  title: string
  content: string  // Markdown格式
  type: 'info' | 'warning' | 'maintenance' | 'important'
  priority: number
  is_pinned: boolean
  is_active: boolean
  author: {
    id: string // UUID
    username: string
  }
  start_time?: string
  end_time?: string
  created_at: string
  updated_at: string
  is_read?: boolean
}

export interface AnnouncementListResponse {
  items: Announcement[]
  total: number
  unread_count: number
}

export interface CreateAnnouncementRequest {
  title: string
  content: string
  type?: 'info' | 'warning' | 'maintenance' | 'important'
  priority?: number
  is_pinned?: boolean
  start_time?: string
  end_time?: string
}

export interface UpdateAnnouncementRequest {
  title?: string
  content?: string
  type?: string
  priority?: number
  is_active?: boolean
  is_pinned?: boolean
  start_time?: string
  end_time?: string
}

export const announcementApi = {
  // 获取公告列表
  async getAnnouncements(params?: {
    active_only?: boolean
    unread_only?: boolean
    limit?: number
    offset?: number
  }): Promise<AnnouncementListResponse> {
    return apiClient.get('/api/announcements', { params })
  },

  // 获取当前有效的公告
  async getActiveAnnouncements(): Promise<AnnouncementListResponse> {
    return apiClient.get('/api/announcements/active')
  },

  // 获取单个公告
  async getAnnouncement(id: string): Promise<Announcement> {
    return apiClient.get(`/api/announcements/${id}`)
  },

  // 标记公告为已读
  async markAsRead(id: string): Promise<{ message: string }> {
    return apiClient.patch(`/api/announcements/${id}/read-status`)
  },

  // 标记所有公告为已读
  async markAllAsRead(): Promise<{ message: string }> {
    return apiClient.post('/api/announcements/read-all')
  },

  // 获取未读公告数量
  async getUnreadCount(): Promise<{ unread_count: number }> {
    return apiClient.get('/api/announcements/users/me/unread-count')
  },

  // 管理员方法
  // 创建公告
  async createAnnouncement(data: CreateAnnouncementRequest): Promise<{ id: string; title: string; message: string }> {
    return apiClient.post('/api/announcements', data)
  },

  // 更新公告
  async updateAnnouncement(id: string, data: UpdateAnnouncementRequest): Promise<{ message: string }> {
    return apiClient.put(`/api/announcements/${id}`, data)
  },

  // 删除公告
  async deleteAnnouncement(id: string): Promise<{ message: string }> {
    return apiClient.delete(`/api/announcements/${id}`)
  }
}
