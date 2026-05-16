export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      alerts: {
        Row: {
          created_at: string
          created_by: string
          id: string
          message: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          message: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          message?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: 'alerts_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      alert_recipients: {
        Row: {
          alert_id: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
        }
        Insert: {
          alert_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id: string
        }
        Update: {
          alert_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'alert_recipients_alert_id_fkey'
            columns: ['alert_id']
            isOneToOne: false
            referencedRelation: 'alerts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'alert_recipients_recipient_id_fkey'
            columns: ['recipient_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      attachments: {
        Row: {
          file_name: string
          file_size: number | null
          id: string
          job_sheet_id: string
          mime_type: string | null
          storage_path: string
          uploaded_at: string
        }
        Insert: {
          file_name: string
          file_size?: number | null
          id?: string
          job_sheet_id: string
          mime_type?: string | null
          storage_path: string
          uploaded_at?: string
        }
        Update: {
          file_name?: string
          file_size?: number | null
          id?: string
          job_sheet_id?: string
          mime_type?: string | null
          storage_path?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'attachments_job_sheet_id_fkey'
            columns: ['job_sheet_id']
            isOneToOne: false
            referencedRelation: 'job_sheets'
            referencedColumns: ['id']
          },
        ]
      }
      job_assignments: {
        Row: {
          assigned_at: string
          id: string
          job_order_id: string
          technician_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          job_order_id: string
          technician_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          job_order_id?: string
          technician_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'job_assignments_job_order_id_fkey'
            columns: ['job_order_id']
            isOneToOne: false
            referencedRelation: 'job_orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'job_assignments_technician_id_fkey'
            columns: ['technician_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      job_orders: {
        Row: {
          created_at: string
          created_by: string
          customer_name: string
          customer_phone: string | null
          description: string
          id: string
          location: string
          priority: 'low' | 'medium' | 'high' | 'urgent'
          scheduled_date: string
          scheduled_time: string | null
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          customer_name: string
          customer_phone?: string | null
          description: string
          id?: string
          location: string
          priority: 'low' | 'medium' | 'high' | 'urgent'
          scheduled_date: string
          scheduled_time?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          customer_name?: string
          customer_phone?: string | null
          description?: string
          id?: string
          location?: string
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          scheduled_date?: string
          scheduled_time?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'job_orders_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      job_sheets: {
        Row: {
          created_at: string
          customer_signature_url: string | null
          id: string
          job_order_id: string
          notes: string | null
          submitted_at: string
          technician_id: string
          time_spent_minutes: number
          work_performed: string
        }
        Insert: {
          created_at?: string
          customer_signature_url?: string | null
          id?: string
          job_order_id: string
          notes?: string | null
          submitted_at?: string
          technician_id: string
          time_spent_minutes: number
          work_performed: string
        }
        Update: {
          created_at?: string
          customer_signature_url?: string | null
          id?: string
          job_order_id?: string
          notes?: string | null
          submitted_at?: string
          technician_id?: string
          time_spent_minutes?: number
          work_performed?: string
        }
        Relationships: [
          {
            foreignKeyName: 'job_sheets_job_order_id_fkey'
            columns: ['job_order_id']
            isOneToOne: false
            referencedRelation: 'job_orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'job_sheets_technician_id_fkey'
            columns: ['technician_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          role: 'admin' | 'technician'
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean
          phone?: string | null
          role: 'admin' | 'technician'
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: 'admin' | 'technician'
          updated_at?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'organizations_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      organization_members: {
        Row: {
          added_by: string | null
          id: string
          joined_at: string
          organization_id: string
          role: 'admin' | 'manager' | 'technician'
          user_id: string
        }
        Insert: {
          added_by?: string | null
          id?: string
          joined_at?: string
          organization_id: string
          role: 'admin' | 'manager' | 'technician'
          user_id: string
        }
        Update: {
          added_by?: string | null
          id?: string
          joined_at?: string
          organization_id?: string
          role?: 'admin' | 'manager' | 'technician'
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'organization_members_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organization_members_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organization_members_added_by_fkey'
            columns: ['added_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_staff_account: {
        Args: {
          p_email: string
          p_password: string
          p_full_name: string
          p_role: string
          p_phone?: string | null
        }
        Returns: string
      }
      create_organization: {
        Args: { org_name: string }
        Returns: Json
      }
      is_org_admin_or_manager: {
        Args: { org_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
