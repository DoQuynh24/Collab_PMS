import {
  Box, Typography, Drawer, IconButton, Divider, List,
  ListItemButton, ListItemIcon, ListItemText, Collapse,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface HelpItem {
  title: string;
  content: string;
}

interface HelpSection {
  icon: React.ReactNode;
  title: string;
  items: HelpItem[];
}

const HELP_SECTIONS: HelpSection[] = [
  {
    icon: <DashboardOutlinedIcon fontSize="small" />,
    title: 'Bảng Kanban',
    items: [
      {
        title: 'Kéo thả nhiệm vụ',
        content: 'Giữ và kéo card nhiệm vụ sang cột khác để thay đổi trạng thái. Cột đích sẽ được highlight màu xanh khi có thể thả vào. Thứ tự trong cột được lưu lại sau khi thả.',
      },
      {
        title: 'Sắp xếp cột trạng thái',
        content: 'Kéo tiêu đề cột (phần chữ in hoa ở đầu cột) để thay đổi thứ tự các cột. Chỉ Admin và Chủ sở hữu mới có thể kéo thả cột. Thứ tự mới áp dụng cho tất cả thành viên.',
      },
      {
        title: 'Thêm nhiệm vụ nhanh',
        content: 'Click "+ Thêm nhiệm vụ" ở đầu mỗi cột để tạo nhiệm vụ mới ngay tại chỗ. Có thể đặt tiêu đề, độ ưu tiên, deadline và người thực hiện mà không cần mở modal. Chỉ Admin và Chủ sở hữu mới thấy nút thêm trạng thái mới.',
      },
      {
        title: 'Nhóm nhiệm vụ',
        content: 'Dùng nút "Nhóm" trên toolbar để nhóm theo người thực hiện hoặc độ ưu tiên. Mỗi nhóm hiển thị đầy đủ các cột trạng thái và có thể thu gọn/mở rộng. Kéo thả vẫn hoạt động trong chế độ nhóm.',
      },
      {
        title: 'Ẩn nhiệm vụ hoàn thành',
        content: 'Vào menu "⋯" → bật "Ẩn nhiệm vụ hoàn thành" để ẩn tất cả task ở cột cuối cùng (cột được coi là hoàn thành). Cài đặt được lưu riêng cho từng dự án.',
      },
    ],
  },
  {
    icon: <TaskAltOutlinedIcon fontSize="small" />,
    title: 'Nhiệm vụ',
    items: [
      {
        title: 'Xem chi tiết nhiệm vụ',
        content: 'Click vào card để mở modal chi tiết. Tại đây có thể chỉnh sửa tiêu đề, mô tả, trạng thái, độ ưu tiên, deadline, người thực hiện và xem toàn bộ lịch sử bình luận.',
      },
      {
        title: 'Chỉnh sửa tiêu đề nhanh',
        content: 'Hover vào card và click icon bút chì để chỉnh sửa tiêu đề trực tiếp trên board. Nhấn Enter để lưu, Esc để hủy.',
      },
      {
        title: 'Bình luận & @mention',
        content: 'Trong chi tiết nhiệm vụ, gõ @ để tag thành viên. Người được tag sẽ nhận thông báo in-app và email. Bình luận hỗ trợ chỉnh sửa và xóa sau khi đã đăng.',
      },
      {
        title: 'Màu sắc deadline',
        content: 'Chip deadline đổi màu theo trạng thái: xanh lá khi còn thời gian, vàng khi đến hạn hôm nay, đỏ khi đã quá hạn. Task ở cột hoàn thành không bị báo đỏ dù đã quá hạn.',
      },
      {
        title: 'Lưu trữ & xóa nhiệm vụ',
        content: 'Mở menu 3 chấm (⋯) trên card để lưu trữ hoặc xóa. Nhiệm vụ đã lưu trữ có thể xem lại trong "Kho lưu trữ" và khôi phục bất kỳ lúc nào. Xóa là hành động vĩnh viễn.',
      },
      {
        title: 'Tài liệu đính kèm',
        content: 'Trong chi tiết nhiệm vụ, phần "Tài liệu liên kết" cho phép tải lên ảnh và file (PDF, Word, Excel, PowerPoint, ZIP...). Kéo thả file vào vùng upload, click để chọn, hoặc Ctrl+V để dán ảnh từ clipboard. File được đưa vào danh sách chờ — xem trước rồi bấm "Tải lên" để xác nhận. Ảnh có thể xem trực tiếp khi click. Chỉ người tải lên, người tạo task, Admin và Chủ sở hữu mới có thể xóa tệp đính kèm.',
      },
    ],
  },
  {
    icon: <FilterListOutlinedIcon fontSize="small" />,
    title: 'Bộ lọc & Hiển thị',
    items: [
      {
        title: 'Bộ lọc nhiệm vụ',
        content: 'Dùng nút "Bộ lọc" để lọc theo người thực hiện, độ ưu tiên hoặc trạng thái. Có thể chọn nhiều giá trị cùng lúc. Bộ lọc áp dụng cho cả bảng thường lẫn chế độ nhóm và cả trang Danh sách.',
      },
      {
        title: 'Tùy chỉnh hiển thị card',
        content: 'Click icon Tune (⚙) để bật/tắt: mã nhiệm vụ (TASK-ID), icon cờ độ ưu tiên, chip deadline và avatar người thực hiện. Cài đặt lưu riêng cho từng dự án.',
      },
      {
        title: 'Tìm kiếm nhiệm vụ',
        content: 'Dùng ô tìm kiếm trên toolbar để lọc nhanh theo tiêu đề. Kết quả cập nhật ngay khi gõ.',
      },
    ],
  },
  {
    icon: <GroupOutlinedIcon fontSize="small" />,
    title: 'Thành viên & Quyền',
    items: [
      {
        title: 'Mời thành viên qua email',
        content: 'Vào Cài đặt dự án → Thành viên & Quyền, hoặc click icon "Thêm thành viên" ở header dự án. Nhập email để gửi lời mời. Chỉ Admin và Chủ sở hữu mới có quyền mời.',
      },
      {
        title: 'Tham gia qua mã dự án',
        content: 'Mã dự án hiển thị ở header dự án (có nút copy). Chia sẻ mã này để người khác tự tìm và gửi yêu cầu tham gia tại trang "Tham gia dự án" trên menu.',
      },
      {
        title: 'Phân quyền thành viên',
        content: 'Có 3 cấp: Chủ sở hữu (toàn quyền), Admin (quản lý thành viên, trạng thái, cài đặt) và Thành viên (tạo và chỉnh sửa nhiệm vụ). Chỉ Chủ sở hữu mới có thể thay đổi vai trò.',
      },
      {
        title: 'Duyệt yêu cầu tham gia',
        content: 'Admin và Chủ sở hữu nhận thông báo khi có yêu cầu tham gia. Vào Cài đặt → Thành viên & Quyền → tab "Yêu cầu tham gia" để duyệt hoặc từ chối.',
      },
      {
        title: 'Quyền truy cập dự án',
        content: 'Đặt dự án là Riêng tư (chỉ thành viên được thêm) hoặc Công khai (mọi người có thể xem). Cài đặt này nằm trong phần Chia sẻ ở header dự án.',
      },
    ],
  },
  {
    icon: <CalendarMonthOutlinedIcon fontSize="small" />,
    title: 'Lịch & Tổng quan',
    items: [
      {
        title: 'Xem nhiệm vụ theo tháng',
        content: 'Trang Lịch hiển thị nhiệm vụ có deadline theo từng ngày. Click vào task để mở modal chi tiết. Dùng mũi tên để chuyển tháng, click "Hôm nay" để về tháng hiện tại.',
      },
      {
        title: 'Tổng quan dự án',
        content: 'Trang Tổng quan hiển thị tiến độ dự án (% hoàn thành), thống kê theo trạng thái, danh sách thành viên và các nhiệm vụ gần đây. Hữu ích để nắm bắt nhanh tình trạng dự án.',
      },
      {
        title: 'Trang Dành cho bạn',
        content: 'Trang chủ hiển thị tổng quan cá nhân: dự án đang tham gia, nhiệm vụ được giao, số task đang làm và quá hạn. Click vào task để mở chi tiết trực tiếp.',
      },
    ],
  },
  {
    icon: <DownloadOutlinedIcon fontSize="small" />,
    title: 'Xuất dữ liệu Excel',
    items: [
      {
        title: 'Xuất từ trang Bảng',
        content: 'Vào menu "⋯" trên toolbar → "Xuất dữ liệu Excel". File .xlsx bao gồm: ID, Tiêu đề, Trạng thái, Độ ưu tiên, Người thực hiện, Hạn hoàn thành, Ngày tạo. Nếu đang bật bộ lọc, hệ thống sẽ hỏi xác nhận trước khi xuất theo bộ lọc.',
      },
      {
        title: 'Xuất từ trang Danh sách',
        content: 'Trang Danh sách cũng có chức năng xuất Excel với cùng bộ lọc và sắp xếp đang áp dụng. Định dạng file giống với xuất từ trang Bảng.',
      },
      {
        title: 'Định dạng file xuất',
        content: 'File Excel có header màu xanh (#5663ee), task quá hạn được tô đỏ ở cột deadline, tổng số theo từng trạng thái in đậm nghiêng ở cuối, thông tin dự án và người xuất ở đầu file.',
      },
    ],
  },
  {
    icon: <NotificationsNoneOutlinedIcon fontSize="small" />,
    title: 'Thông báo',
    items: [
      {
        title: 'Các loại thông báo',
        content: 'Hệ thống gửi thông báo cho các sự kiện: được giao nhiệm vụ, thay đổi trạng thái task, bình luận mới trên task bạn tạo, được @mention, yêu cầu tham gia dự án (admin/owner), deadline sắp tới (trước 1 ngày) và task quá hạn.',
      },
      {
        title: 'Thông báo in-app',
        content: 'Click icon chuông ở header để xem tất cả thông báo. Có 2 tab: Tất cả và Chưa đọc. Click vào thông báo để điều hướng đến nội dung liên quan. Có thể xóa từng thông báo hoặc xóa tất cả.',
      },
      {
        title: 'Thông báo qua email',
        content: 'Một số sự kiện gửi kèm email: được giao nhiệm vụ, thay đổi trạng thái, @mention, deadline sắp tới, task quá hạn và yêu cầu tham gia dự án (admin/owner).',
      },
      {
        title: 'Tùy chỉnh thông báo',
        content: 'Vào Cài đặt dự án → Thông báo để bật/tắt từng loại thông báo (in-app và email) cho từng dự án. Cài đặt áp dụng riêng cho bạn, không ảnh hưởng thành viên khác. Deadline sắp tới và quá hạn luôn bật và không thể tắt.',
      },
    ],
  },
  {
    icon: <SettingsOutlinedIcon fontSize="small" />,
    title: 'Cài đặt dự án',
    items: [
      {
        title: 'Quản lý trạng thái',
        content: 'Vào Cài đặt → Quản lý trạng thái để thêm, đổi tên, sắp xếp hoặc xóa các cột trạng thái. Cột ở vị trí cuối cùng được coi là "hoàn thành" khi tính tiến độ. Chỉ Admin và Chủ sở hữu mới có quyền thay đổi.',
      },
      {
        title: 'Cài đặt chung',
        content: 'Vào Cài đặt → Cài đặt chung để đổi tên dự án, thêm mô tả và thay đổi quyền truy cập (Riêng tư/Công khai). Chỉ Chủ sở hữu mới có thể xóa dự án.',
      },
      {
        title: 'Kho lưu trữ',
        content: 'Nhiệm vụ đã lưu trữ được lưu trong Kho lưu trữ (menu bên trái). Có thể xem, khôi phục hoặc xóa vĩnh viễn từng nhiệm vụ. Chỉ Admin, Chủ sở hữu và người tạo task mới có thể lưu trữ.',
      },
    ],
  },
];

export function HelpPanel({ open, onClose }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggleSection = (title: string) => {
    setExpanded(prev => prev === title ? null : title);
    setExpandedItem(null);
  };

  const toggleItem = (key: string) => {
    setExpandedItem(prev => prev === key ? null : key);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="temporary"
      slotProps={{ backdrop: { invisible: true } }}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 2,
        '& .MuiDrawer-paper': {
          width: 400,
          top: '60px',
          height: 'calc(100% - 60px)',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.12)',
          borderLeft: '1px solid #e5e7eb',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 2, borderBottom: '1px solid #f3f4f6' }}>
        <Box>
          <Typography fontSize={16} fontWeight={700} color="#111827">Trợ giúp</Typography>
          <Typography fontSize={12} color="#9ca3af">Hướng dẫn sử dụng Collab - Project Management System</Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: '#6b7280' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ mx: 2.5, my: 2, p: 1.5, bgcolor: '#eef0ff', borderRadius: '8px', border: '1px solid #c7d0ff' }}>
        <Typography fontSize={12} color="#4451d4">
          💡 Nhấn <strong>?</strong> bất kỳ lúc nào để mở/đóng panel trợ giúp này.
        </Typography>
      </Box>

      <Divider />

      <List disablePadding sx={{ overflowY: 'auto', flex: 1 }}>
        {HELP_SECTIONS.map((section) => {
          const isOpen = expanded === section.title;
          return (
            <Box key={section.title}>
              <ListItemButton
                onClick={() => toggleSection(section.title)}
                sx={{ px: 2.5, py: 1.5, '&:hover': { bgcolor: '#f8fafc' } }}
              >
                <ListItemIcon sx={{ minWidth: 32, color: '#5663ee' }}>
                  {section.icon}
                </ListItemIcon>
                <ListItemText
                  primary={section.title}
                  slotProps={{ primary: { fontSize: 14, fontWeight: 600, color: '#374151' } }}
                />
                {isOpen
                  ? <KeyboardArrowDownIcon fontSize="small" sx={{ color: '#9ca3af' }} />
                  : <KeyboardArrowRightIcon fontSize="small" sx={{ color: '#9ca3af' }} />
                }
              </ListItemButton>

              <Collapse in={isOpen} timeout={200}>
                {section.items.map((item) => {
                  const itemKey = `${section.title}-${item.title}`;
                  const itemOpen = expandedItem === itemKey;
                  return (
                    <Box key={itemKey}>
                      <ListItemButton
                        onClick={() => toggleItem(itemKey)}
                        sx={{ pl: 5.5, pr: 2.5, py: 1, bgcolor: '#fafafa', '&:hover': { bgcolor: '#f3f4f6' } }}
                      >
                        <ListItemText
                          primary={item.title}
                          slotProps={{ primary: { fontSize: 13, color: '#4b5563' } }}
                        />
                        {itemOpen
                          ? <KeyboardArrowDownIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
                          : <KeyboardArrowRightIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
                        }
                      </ListItemButton>
                      <Collapse in={itemOpen} timeout={150}>
                        <Box sx={{ pl: 4, pr: 2, py: 1.5, bgcolor: '#f8fafc', borderLeft: '3px solid #5663ee', ml: 2.5, mr: 2.5, mb: 0.5, borderRadius: '0 6px 6px 0' }}>
                          <Typography fontSize={12} color="#6b7280" lineHeight={1.7}>
                            {item.content}
                          </Typography>
                        </Box>
                      </Collapse>
                    </Box>
                  );
                })}
              </Collapse>
              <Divider />
            </Box>
          );
        })}
      </List>

      <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid #f3f4f6', bgcolor: '#fafafa' }}>
        <Typography fontSize={11} color="#9ca3af" textAlign="center">
          Collab - Project Management System · Phiên bản 1.0
        </Typography>
      </Box>
    </Drawer>
  );
}

