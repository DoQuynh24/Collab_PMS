import { useRef, useCallback, useContext, useState } from 'react';
import {
  Box, Typography, IconButton, Tooltip, Avatar,
  CircularProgress, Button,
  useMediaQuery,
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import UploadIcon from '@mui/icons-material/Upload';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import FolderZipOutlinedIcon from '@mui/icons-material/FolderZipOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useGetAttachments } from '../api/get-attachments';
import { uploadAttachment } from '../api/upload-attachment';
import { useDeleteAttachment } from '../api/delete-attachment';
import { useGetCurrentUser } from '../../login/api/auth';
import { ToastContext } from '../../../components/notification/NotifiProvider';
import { useQueryClient } from '@tanstack/react-query';
import { ModalConfirm } from '../../../components/modal/modalConfirm';
import type { IAttachment } from '../types';

const BLOCKED_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'com', 'msi', 'scr', 'vbs', 'vbe',
  'js', 'jse', 'wsf', 'ps1', 'reg', 'dll', 'sys',
  'jar', 'sh', 'bash', 'php', 'asp', 'aspx', 'jsp', 'hta', 'html', 'htm',
]);
const MAX_SIZE = 20 * 1024 * 1024;

interface PendingFile {
  id: string;
  file: File;
  previewUrl?: string;
  error?: string;
}

interface Props {
  taskId: number;
  taskCreatedBy: number;
  projectMembers: any[];
  projectOwnerId?: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('image/')) return <ImageOutlinedIcon sx={{ fontSize: 18, color: '#5663ee' }} />;
  if (mimeType === 'application/pdf') return <PictureAsPdfOutlinedIcon sx={{ fontSize: 18, color: '#ef4444' }} />;
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z'))
    return <FolderZipOutlinedIcon sx={{ fontSize: 18, color: '#f59e0b' }} />;
  return <InsertDriveFileOutlinedIcon sx={{ fontSize: 18, color: '#6b7280' }} />;
}

function openFile(url: string) {
  window.open(url, '_blank');
}

export default function TaskAttachments({ taskId, taskCreatedBy, projectMembers, projectOwnerId }: Props) {
  const isMobile = useMediaQuery('(max-width:900px)');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const { data: attachments = [], isLoading } = useGetAttachments(taskId);
  const { mutate: deleteAttachment } = useDeleteAttachment(taskId);
  const { data: currentUser } = useGetCurrentUser();
  const { showToast } = useContext(ToastContext)!;
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [deletingAttachment, setDeletingAttachment] = useState<IAttachment | null>(null);

  const isOwner = projectOwnerId === currentUser?.user_id;
  const isAdmin = projectMembers.some(
    (m: any) => m.user_id === currentUser?.user_id && m.role === 'admin'
  );
  const isTaskCreator = taskCreatedBy === currentUser?.user_id;

  const canDeleteAttachment = (uploadedBy: number) =>
    uploadedBy === currentUser?.user_id || isTaskCreator || isOwner || isAdmin;

  const validateFile = (file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (BLOCKED_EXTENSIONS.has(ext)) return `File .${ext} không được phép`;
    if (file.size > MAX_SIZE) return 'Vượt quá 20MB';
    return null;
  };

  const addPendingFiles = useCallback((files: File[]) => {
    const newPending: PendingFile[] = files.map(file => {
      const error = validateFile(file) ?? undefined;
      const previewUrl = file.type.startsWith('image/') && !error
        ? URL.createObjectURL(file) : undefined;
      return { id: `${file.name}-${Date.now()}-${Math.random()}`, file, previewUrl, error };
    });
    setPendingFiles(prev => [...prev, ...newPending]);
  }, []);

  const removePending = (id: string) => {
    setPendingFiles(prev => {
      const item = prev.find(p => p.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter(p => p.id !== id);
    });
  };

  const clearAll = () => {
    pendingFiles.forEach(p => { if (p.previewUrl) URL.revokeObjectURL(p.previewUrl); });
    setPendingFiles([]);
  };

  const handleUploadAll = async () => {
    const valid = pendingFiles.filter(p => !p.error);
    if (!valid.length) return;

    setIsUploading(true);

    const results = await Promise.allSettled(
      valid.map(pending => uploadAttachment(taskId, pending.file))
    );

    let successCount = 0;
    let errorCount = 0;

    results.forEach((result, idx) => {
      const pending = valid[idx];
      if (result.status === 'fulfilled') {
        if (pending.previewUrl) URL.revokeObjectURL(pending.previewUrl);
        setPendingFiles(prev => prev.filter(p => p.id !== pending.id));
        successCount++;
      } else {
        const msg = (result.reason as any)?.response?.data?.message || 'Tải lên thất bại';
        setPendingFiles(prev => prev.map(p => p.id === pending.id ? { ...p, error: msg } : p));
        errorCount++;
      }
    });

    queryClient.invalidateQueries({ queryKey: ['attachments', taskId] });

    setIsUploading(false);

    if (successCount > 0) showToast(`Đã tải lên ${successCount} file thành công`, 'success');
    if (errorCount > 0) showToast(`${errorCount} file tải lên thất bại`, 'error');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addPendingFiles(Array.from(e.target.files ?? []));
    e.target.value = '';
  };

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const files = Array.from(e.clipboardData.items)
      .filter(i => i.kind === 'file').map(i => i.getAsFile()).filter(Boolean) as File[];
    if (files.length) addPendingFiles(files);
  }, [addPendingFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    addPendingFiles(Array.from(e.dataTransfer.files));
  }, [addPendingFiles]);

  const validCount = pendingFiles.filter(p => !p.error).length;
  const hasContent = attachments.length > 0 || pendingFiles.length > 0;

  return (
    <Box onPaste={handlePaste}>
      <Box
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.25,
          flexDirection: isMobile ? 'column' : 'row',
          textAlign: isMobile ? 'center' : 'left',
          border: `1.5px dashed ${isDragOver ? '#5663ee' : '#d1d5db'}`,
          borderRadius: isMobile ? '14px' : '8px',
          px: 2, py: isMobile ? 1.75 : 1.5,
          cursor: 'pointer',
          bgcolor: isDragOver ? '#eef0ff' : 'transparent',
          transition: 'all 0.15s',
          mb: 1.5,
          '&:hover': { borderColor: '#5663ee', bgcolor: '#f8f9ff' },
        }}
      >
        <AttachFileIcon sx={{ fontSize: 18, color: '#9ca3af', flexShrink: 0 }} />
        <Box>
          <Typography fontSize={13} color="#6b7280">
            Kéo thả, chạm để chọn hoặc <strong>{isMobile ? 'dán ảnh' : 'Ctrl+V'}</strong> {isMobile ? 'từ bàn phím' : 'để dán ảnh'}
          </Typography>
          <Typography fontSize={11} color="#9ca3af">
            Ảnh, PDF, Word, Excel, PowerPoint, ZIP · Tối đa 20MB
          </Typography>
        </Box>
      </Box>

      <input
        ref={fileInputRef} type="file" multiple style={{ display: 'none' }}
        onChange={handleFileChange}
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z"
      />

      {pendingFiles.length > 0 && (
        <Box sx={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', mb: 1.5 }}>
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 1 : 0,
            px: 2, py: 1, bgcolor: '#f9fafb', borderBottom: '1px solid #e5e7eb',
          }}>
            <Typography fontSize={12} fontWeight={600} color="#374151">
              Chờ tải lên ({pendingFiles.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <Button size="small" onClick={clearAll}
                sx={{ fontSize: 11, color: '#9ca3af', textTransform: 'none', minWidth: 0, px: 1, py: 0.3 }}>
                Xóa tất cả
              </Button>
              <Button
                size="small" variant="contained"
                startIcon={isUploading ? <CircularProgress size={10} color="inherit" /> : <UploadIcon sx={{ fontSize: 14 }} />}
                onClick={handleUploadAll}
                disabled={isUploading || validCount === 0}
                sx={{
                  fontSize: 11, textTransform: 'none', py: 0.4, px: 1.5,
                  bgcolor: '#5663ee', '&:hover': { bgcolor: '#4451d4' },
                  '&.Mui-disabled': { bgcolor: '#c7d0ff', color: '#fff' },
                }}
              >
                Tải lên{validCount > 0 ? ` (${validCount})` : ''}
              </Button>
            </Box>
          </Box>

          {pendingFiles.map((p, idx) => (
            <Box key={p.id} sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              px: 2, py: 1,
              borderBottom: idx < pendingFiles.length - 1 ? '1px solid #f3f4f6' : 'none',
              bgcolor: p.error ? '#fef9f9' : 'transparent',
            }}>
              {p.previewUrl ? (
                <Box component="img" src={p.previewUrl}
                  sx={{ width: 32, height: 32, objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />
              ) : (
                <Box sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f3f4f6', borderRadius: '4px', flexShrink: 0 }}>
                  <FileIcon mimeType={p.file.type} />
                </Box>
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontSize={12} fontWeight={500} color={p.error ? '#dc2626' : '#111827'} noWrap>
                  {p.file.name}
                </Typography>
                <Typography fontSize={11} color={p.error ? '#ef4444' : '#9ca3af'}>
                  {p.error ?? formatBytes(p.file.size)}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => removePending(p.id)}
                sx={{ color: '#9ca3af', '&:hover': { color: '#ef4444' }, p: 0.3 }}>
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={22} sx={{ color: '#5663ee' }} />
        </Box>
      ) : !hasContent ? (
        <Typography fontSize={12} color="#9ca3af" textAlign="center" py={1.5}>
          Chưa có tệp đính kèm nào.
        </Typography>
      ) : attachments.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
          {attachments.map((att) => (
            <Box key={att.id} sx={{
              display: 'flex', gap: 1.5,
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'center',
              px: 1.5, py: 1, border: '1px solid #e5e7eb', borderRadius: '8px',
              '&:hover': { bgcolor: '#f9fafb' },
            }}>
              <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center', minWidth: 0 }}>
                {att.file_type === 'image' ? (
                  <Box component="img" src={att.file_url} alt={att.file_name}
                    sx={{ width: 36, height: 36, objectFit: 'cover', borderRadius: '4px', flexShrink: 0, cursor: 'pointer' }}
                    onClick={() => window.open(att.file_url, '_blank')} />
                ) : (
                  <Box sx={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f3f4f6', borderRadius: '4px', flexShrink: 0, cursor: 'pointer' }}
                    onClick={() => openFile(att.file_url)}>
                    <FileIcon mimeType={att.mime_type} />
                  </Box>
                )}

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontSize={13} fontWeight={500} color="#111827" noWrap
                    sx={{ cursor: 'pointer', '&:hover': { color: '#5663ee', textDecoration: 'underline' } }}
                    onClick={() => openFile(att.file_url)}>
                    {att.file_name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                    <Typography fontSize={11} color="#9ca3af">{formatBytes(att.file_size)}</Typography>
                    {att.uploader && (
                      <>
                        <Typography fontSize={11} color="#e5e7eb">·</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                          <Avatar src={att.uploader.picture} sx={{ width: 13, height: 13, fontSize: 8 }}>
                            {att.uploader.name?.charAt(0)}
                          </Avatar>
                          <Typography fontSize={11} color="#9ca3af">{att.uploader.name}</Typography>
                        </Box>
                      </>
                    )}
                    <Typography fontSize={11} color="#e5e7eb">·</Typography>
                    <Typography fontSize={11} color="#9ca3af">
                      {formatDistanceToNow(new Date(att.created_at), { addSuffix: true, locale: vi })}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 0.3, flexShrink: 0, justifyContent: isMobile ? 'flex-end' : 'flex-start' }}>
                <Tooltip title="Tải xuống">
                  <IconButton size="small" component="a" href={att.file_url} download={att.file_name} target="_blank"
                    sx={{ color: '#9ca3af', '&:hover': { color: '#5663ee' }, p: 0.5 }}>
                    <DownloadIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
                {canDeleteAttachment(att.uploaded_by) && (
                  <Tooltip title="Xóa">
                    <IconButton size="small"
                      onClick={() => setDeletingAttachment(att)}
                      sx={{ color: '#9ca3af', '&:hover': { color: '#ef4444' }, p: 0.5 }}>
                      <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      ) : null}

      <ModalConfirm
        open={!!deletingAttachment}
        setOpen={(v) => { if (!v) setDeletingAttachment(null); }}
        title="Xóa tệp đính kèm"
        message={
          <>
            Bạn có chắc chắn muốn xóa <strong>{deletingAttachment?.file_name}</strong>?
            <br />Hành động này không thể hoàn tác.
          </>
        }
        titleButton="Xóa"
        cancelButtonText="Hủy"
        isDelete
        confirmButtonProps={{ sx: { bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } } }}
        onClick={() => {
          if (!deletingAttachment) return;
          deleteAttachment(deletingAttachment.id, {
            onSuccess: () => showToast('Đã xóa tệp đính kèm', 'success'),
            onError: () => showToast('Xóa thất bại', 'error'),
          });
          setDeletingAttachment(null);
        }}
      />
    </Box>
  );
}
