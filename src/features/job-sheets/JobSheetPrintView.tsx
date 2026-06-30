import { createPortal } from 'react-dom'
import { useOrganization } from '../../context/OrganizationContext'
import { supabase } from '../../lib/supabase'
import { formatDuration } from '../../utils/formatters'
import type { JobSheetWithDetail } from './hooks'
import {
  Lbl, Val, PrintHeader, PrintFooter,
  SEC, BORDER, STATUS_LABEL, PRIORITY_LABEL, getJobTypeLabel,
} from './JobSheetPrintHelpers'

function getPublicUrl(path: string) {
  return supabase.storage.from('job-attachments').getPublicUrl(path).data.publicUrl
}

interface Props { sheet: JobSheetWithDetail }

export function JobSheetPrintView({ sheet }: Props) {
  const { activeOrg } = useOrganization()
  const orgName = activeOrg?.name ?? 'Professional Services'

  const sheetNum    = sheet.sheet_number != null
    ? String(sheet.sheet_number).padStart(6, '0')
    : sheet.id.slice(0, 8).toUpperCase()
  const custName    = sheet.customer_name  ?? sheet.job_orders?.customer_name ?? '—'
  const custPhone   = sheet.customer_phone ?? sheet.job_orders?.customer_phone ?? '—'
  const location    = sheet.job_location   ?? sheet.job_orders?.location       ?? '—'
  const jobDate     = sheet.job_date
    ? new Date(sheet.job_date + 'T00:00:00').toLocaleDateString('en-MY')
    : new Date(sheet.submitted_at).toLocaleDateString('en-MY')
  const scheduledDate = sheet.job_orders?.scheduled_date
    ? new Date(sheet.job_orders.scheduled_date + 'T00:00:00').toLocaleDateString('en-MY')
    : '—'
  const jobDesc     = sheet.job_description ?? sheet.job_orders?.description ?? null
  const timeIn      = sheet.time_in  ?? '—'
  const timeOut     = sheet.time_out ?? '—'
  const techName    = sheet.profiles?.display_name ?? sheet.profiles?.full_name ?? '—'
  const extraTech   = sheet.additional_technician_names ?? []
  const submittedAt = new Date(sheet.submitted_at).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })

  // Split attachments by folder: /photos/ = site photos, /payment/ = payment evidence
  const sitePhotos    = sheet.attachments.filter((a) => a.storage_path.includes('/photos/')).slice(0, 6)
  const paymentPhotos = sheet.attachments.filter((a) => a.storage_path.includes('/payment/')).slice(0, 6)
  const hasPhotos     = sitePhotos.length > 0 || paymentPhotos.length > 0

  // Shared inline styles
  const sigCol: React.CSSProperties = { flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column' }
  const sigImgBox: React.CSSProperties = {
    height: 110, margin: '6px 0', border: BORDER, borderRadius: 4, backgroundColor: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  }
  const photoBox: React.CSSProperties = {
    height: 108, border: BORDER, borderRadius: 3, overflow: 'hidden', backgroundColor: '#F9FAFB',
  }

  return createPortal(
    <div className="job-sheet-print-area" style={{ width: '210mm', height: '297mm', backgroundColor: 'white', fontFamily: "'Arial','Helvetica',sans-serif", boxSizing: 'border-box', display: 'flex', flexDirection: 'column', paddingTop: '5mm' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        <PrintHeader orgName={orgName} sheetNum={sheetNum} />

        <div style={{ padding: '0 10mm 20mm', flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* ── INFO GRID ── */}
          <div style={{ border: BORDER, borderTop: 'none' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: BORDER }}>
              <div style={{ padding: '9px 12px', borderRight: BORDER }}><Lbl>Customer / Client Name</Lbl><Val>{custName}</Val></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ padding: '9px 12px', borderRight: BORDER }}><Lbl>Date</Lbl><Val>{jobDate}</Val></div>
                <div style={{ padding: '9px 12px' }}><Lbl>Sheet Ref</Lbl><Val>JS-{sheetNum}</Val></div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: BORDER }}>
              <div style={{ padding: '9px 12px', borderRight: BORDER }}><Lbl>Location / Site Address</Lbl><Val>{location}</Val></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ padding: '9px 12px', borderRight: BORDER }}><Lbl>Time In</Lbl><Val>{timeIn}</Val></div>
                <div style={{ padding: '9px 12px' }}><Lbl>Time Out</Lbl><Val>{timeOut}</Val></div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <div style={{ padding: '9px 12px', borderRight: BORDER }}><Lbl>Contact (H/P)</Lbl><Val>{custPhone}</Val></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ padding: '9px 12px', borderRight: BORDER }}><Lbl>Lead Technician</Lbl><Val>{techName}</Val></div>
                <div style={{ padding: '9px 12px' }}><Lbl>Time Spent</Lbl><Val>{formatDuration(sheet.time_spent_minutes)}</Val></div>
              </div>
            </div>
          </div>

          {/* ── JOB DETAILS ── */}
          <div style={{ border: BORDER, borderTop: 'none' }}>
            <div style={SEC}>Job Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', borderBottom: BORDER }}>
              <div style={{ padding: '9px 10px', borderRight: BORDER }}><Lbl>Job Title</Lbl><Val>{sheet.job_title ?? sheet.job_orders?.title ?? '—'}</Val></div>
              <div style={{ padding: '9px 10px', borderRight: BORDER }}><Lbl>Status</Lbl><Val>{STATUS_LABEL[sheet.job_orders?.status ?? ''] ?? '—'}</Val></div>
              <div style={{ padding: '9px 10px' }}><Lbl>Priority</Lbl><Val>{PRIORITY_LABEL[sheet.job_orders?.priority ?? ''] ?? '—'}</Val></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', ...(jobDesc ? { borderBottom: BORDER } : {}) }}>
              <div style={{ padding: '9px 10px', borderRight: BORDER }}><Lbl>Type of Work</Lbl><Val>{getJobTypeLabel(sheet.job_type)}</Val></div>
              <div style={{ padding: '9px 10px' }}>
                <Lbl>Scheduled</Lbl>
                <Val>{scheduledDate}{sheet.job_orders?.scheduled_time ? ` · ${sheet.job_orders.scheduled_time}` : ''}</Val>
              </div>
            </div>
            {jobDesc && (
              <div style={{ padding: '9px 10px' }}>
                <Lbl>Job Description</Lbl>
                <p style={{ fontSize: 11, color: '#374151', lineHeight: 1.5, whiteSpace: 'pre-wrap', margin: '3px 0 0' }}>{jobDesc}</p>
              </div>
            )}
          </div>

          {/* ── WORK PERFORMED ── */}
          <div style={{ border: BORDER, borderTop: 'none' }}>
            <div style={SEC}>Work Performed / Findings</div>
            <div style={{ padding: '8px 12px', minHeight: 72 }}>
              <p style={{ fontSize: 11.5, color: '#1F2937', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>{sheet.work_performed}</p>
            </div>
          </div>

          {/* ── SERVICE DESCRIPTION ── */}
          {sheet.service_description && (
            <div style={{ border: BORDER, borderTop: 'none' }}>
              <div style={SEC}>Service Description / Materials Used</div>
              <div style={{ padding: '8px 12px', minHeight: 36 }}>
                <p style={{ fontSize: 11.5, color: '#1F2937', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>{sheet.service_description}</p>
              </div>
            </div>
          )}

          {/* ── TECHNICIAN REMARKS ── */}
          {sheet.notes && (
            <div style={{ border: BORDER, borderTop: 'none' }}>
              <div style={SEC}>Technician Remarks / Additional Notes</div>
              <div style={{ padding: '8px 12px', minHeight: 28 }}>
                <p style={{ fontSize: 11.5, color: '#374151', lineHeight: 1.5, whiteSpace: 'pre-wrap', margin: 0 }}>{sheet.notes}</p>
              </div>
            </div>
          )}

          {/* ── PHOTOS: left = 3 site photos grid, right = 1 payment evidence box ── */}
          {hasPhotos && (
            <div style={{ border: BORDER, borderTop: 'none', display: 'grid', gridTemplateColumns: '2fr 1fr' }}>
              {/* Site Photos — up to 3 in a 3-col grid */}
              <div style={{ borderRight: BORDER }}>
                <div style={SEC}>Site Photos / Documentation ({sitePhotos.length})</div>
                <div style={{ padding: '6px 8px' }}>
                  {sitePhotos.length > 0
                    ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
                        {sitePhotos.map((att) => (
                          <div key={att.id} style={photoBox}>
                            <img src={getPublicUrl(att.storage_path)} alt={att.file_name} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                          </div>
                        ))}
                      </div>
                    : <span style={{ fontSize: 8, color: '#9CA3AF' }}>No site photos provided</span>}
                </div>
              </div>
              {/* Payment Evidence — 1 prominent full-column box */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={SEC}>Payment Evidence</div>
                <div style={{ flex: 1, padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {paymentPhotos.length > 0
                    ? <div style={{ width: '100%', height: 116, border: BORDER, borderRadius: 4, overflow: 'hidden', backgroundColor: '#F9FAFB' }}>
                        <img src={getPublicUrl(paymentPhotos[0].storage_path)} alt={paymentPhotos[0].file_name} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                      </div>
                    : <span style={{ fontSize: 8, color: '#9CA3AF' }}>Not provided</span>}
                </div>
              </div>
            </div>
          )}

          {/* ── PAYMENT + TECHNICIANS ── */}
          <div style={{ border: BORDER, borderTop: 'none', display: 'grid', gridTemplateColumns: '1fr 2fr' }}>
            <div style={{ borderRight: BORDER, padding: '10px 12px' }}>
              <Lbl>Total Amount (RM)</Lbl>
              <div style={{ fontWeight: 'bold', fontSize: 22, color: '#1E3A5F', marginTop: 4, fontFamily: 'monospace' }}>
                {sheet.total_amount != null ? `RM ${sheet.total_amount.toFixed(2)}` : 'RM ___________'}
              </div>
            </div>
            <div style={{ padding: '10px 12px' }}>
              <Lbl>Technicians Involved</Lbl>
              <div style={{ marginTop: 4 }}>
                <div style={{ fontSize: 11, color: '#374151' }}>Lead: {techName}</div>
                {extraTech.map((name, i) => (
                  <div key={i} style={{ fontSize: 11, color: '#374151' }}>{i + 2}. {name}</div>
                ))}
              </div>
            </div>
          </div>

          {/* ── SIGNATURES — fixed 110 px image boxes, side-by-side flex ── */}
          <div style={{ border: BORDER, borderTop: 'none', display: 'flex' }}>
            <div style={{ ...sigCol, borderRight: BORDER }}>
              <div style={{ fontSize: 10, fontWeight: 'bold', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Technician Signature &amp; Acknowledgment</div>
              <div style={sigImgBox}>
                {sheet.technician_signature_url
                  ? <img src={sheet.technician_signature_url} alt="Technician signature" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                  : <span style={{ fontSize: 9.5, color: '#9CA3AF' }}>No signature captured</span>}
              </div>
              <div style={{ fontSize: 10, color: '#374151', fontWeight: 600 }}>Name: {sheet.profiles?.full_name ?? '—'}</div>
              {extraTech.length > 0 && <div style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}>Others: {extraTech.join(', ')}</div>}
              <div style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}>Date &amp; Time: {submittedAt}</div>
            </div>
            <div style={sigCol}>
              <div style={{ fontSize: 10, fontWeight: 'bold', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer Signature &amp; Acceptance</div>
              <div style={sigImgBox}>
                {sheet.customer_signature_url
                  ? <img src={sheet.customer_signature_url} alt="Customer signature" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                  : <span style={{ fontSize: 9.5, color: '#9CA3AF' }}>No signature captured</span>}
              </div>
              <div style={{ fontSize: 10, color: '#374151', fontWeight: 600 }}>Name: {custName}</div>
              <div style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}>Date &amp; Time: {submittedAt}</div>
            </div>
          </div>

        </div>{/* end content padding */}

        <PrintFooter orgName={orgName} />
      </div>
    </div>,
    document.body,
  )
}
