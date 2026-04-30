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
        content: 'Giữ và kéo card nhiệm vụ sang cột khác để thay đổi trạng thái. Khi đang kéo, cột đích sẽ được highlight màu xanh để báo hiệu có thể thả vào. Thứ tự trong cột cũng được lưu lại sau khi thả.',
      },
      {
        title: 'Sắp xếp cột',
        content: 'Kéo tiêu đề cột (phần chữ in hoa ở đầu cột) để thay đổi thứ tự các cột trên bảng. Thứ tự mới sẽ được lưu và áp dụng cho tất cả thành viên trong dự án.',
      },
      {
        title: 'Thêm nhiệm vụ',
        content: 'Click "+ Thêm nhiệm vụ" ở đầu mỗi cột để tạo nhanh nhiệm vụ mới. Bạn có thể đặt tiêu đề, độ ưu tiên, deadline và người thực hiện ngay tại chỗ mà không cần mở modal.',
      },
      {
        title: 'Nhóm nhiệm vụ',
        content: 'Dùng nút "Nhóm" trên toolbar để nhóm các nhiệm vụ theo người thực hiện hoặc độ ưu tiên. Mỗi nhóm hiển thị đầy đủ các cột trạng thái và có thể thu gọn/mở rộng bằng cách click vào tiêu đề nhóm. Kéo thả vẫn hoạt động bình thường trong chế độ nhóm.',
      },
    ],
  },
  {
    icon: <TaskAltOutlinedIcon fontSize="small" />,
    title: 'Nhiệm vụ',
    items: [
      {
        title: 'Xem chi tiết nhiệm vụ',
        content: 'Click vào card để mở modal chi tiết. Tại đây bạn có thể chỉnh sửa tiêu đề, mô tả (hỗ trợ @mention thành viên), thay đổi trạng thái, độ ưu tiên, deadline, người thực hiện và xem toàn bộ lịch sử bình luận.',
      },
      {
        title: 'Chỉnh sửa tiêu đề nhanh',
        content: 'Hover vào card và click icon bút chì để chỉnh sửa tiêu đề trực tiếp trên board mà không cần mở modal. Nhấn Enter để lưu, Esc để hủy bỏ thay đổi.',
      },
      {
        title: 'Bình luận & @mention',
        content: 'Trong phần bình luận của chi tiết nhiệm vụ, gõ @ để tag thành viên trong dự án. Danh sách gợi ý sẽ hiện ra để bạn chọn. Bình luận hỗ trợ chỉnh sửa và xóa sau khi đã đăng.',
      },
      {
        title: 'Lưu trữ & xóa nhiệm vụ',
        content: 'Mở menu 3 chấm (⋯) trên card để lưu trữ hoặc xóa nhiệm vụ. Nhiệm vụ đã lưu trữ có thể xem lại trong trang "Lưu trữ" của dự án và khôi phục bất kỳ lúc nào. Xóa là hành động vĩnh viễn và không thể hoàn tác.',
      },
      {
        title: 'Màu sắc deadline',
        content: 'Chip deadline trên card đổi màu theo trạng thái: xanh lá khi còn nhiều thời gian, vàng khi sắp đến hạn và đỏ khi đã quá hạn. Viền card cũng đổi màu đỏ khi nhiệm vụ quá hạn.',
      },
    ],
  },
  {
    icon: <FilterListOutlinedIcon fontSize="small" />,
    title: 'Bộ lọc & Hiển thị',
    items: [
      {
        title: 'Bộ lọc nhiệm vụ',
        content: 'Dùng nút "Bộ lọc" trên toolbar để lọc theo người thực hiện, độ ưu tiên hoặc trạng thái. Có thể chọn nhiều giá trị cùng lúc. Khi bộ lọc đang hoạt động, nút sẽ đổi màu xanh để nhắc nhở. Bộ lọc áp dụng cho cả chế độ bảng thường lẫn chế độ nhóm.',
      },
      {
        title: 'Tùy chỉnh hiển thị card',
        content: 'Click icon Tune (⚙) để bật/tắt từng thông tin hiển thị trên card: mã nhiệm vụ (TASK-ID), icon cờ độ ưu tiên, chip deadline và avatar người thực hiện. Cài đặt được lưu riêng cho từng dự án và giữ nguyên khi reload trang.',
      },
      {
        title: 'Ẩn nhiệm vụ hoàn thành',
        content: 'Vào menu "⋯" → bật "Ẩn nhiệm vụ hoàn thành" để ẩn tất cả task ở cột cuối cùng (cột được coi là hoàn thành theo cài đặt quản lý trạng thái). Hữu ích khi bảng có quá nhiều task đã xong. Cài đặt được lưu và giữ nguyên khi reload trang.',
      },
      {
        title: 'Tìm kiếm nhiệm vụ',
        content: 'Dùng ô tìm kiếm trên toolbar để lọc nhanh nhiệm vụ theo tiêu đề. Kết quả được cập nhật ngay khi gõ, không cần nhấn Enter.',
      },
    ],
  },
  {
    icon: <GroupOutlinedIcon fontSize="small" />,
    title: 'Thành viên & Quyền',
    items: [
      {
        title: 'Mời thành viên qua email',
        content: 'Vào Cài đặt dự án → tab Thành viên → nhập địa chỉ email để gửi lời mời. Người được mời sẽ nhận email với link tham gia trực tiếp. Chỉ Admin và Chủ sở hữu mới có quyền gửi lời mời.',
      },
      {
        title: 'Chia sẻ mã dự án',
        content: 'Mã dự án hiển thị trong phần header của trang dự án (có nút copy). Chia sẻ mã này cho người khác để họ tự tìm kiếm và gửi yêu cầu tham gia tại trang "Tham gia dự án" trên menu Dự án.',
      },
      {
        title: 'Phân quyền thành viên',
        content: 'Có 3 cấp quyền: Chủ sở hữu (toàn quyền, không thể bị xóa), Admin (quản lý thành viên, trạng thái, cài đặt dự án) và Thành viên (tạo và chỉnh sửa nhiệm vụ). Chủ sở hữu và Admin có thể thay đổi vai trò của thành viên khác trong tab Thành viên.',
      },
      {
        title: 'Duyệt yêu cầu tham gia',
        content: 'Khi có người gửi yêu cầu tham gia qua mã dự án, Admin và Chủ sở hữu sẽ thấy thông báo trong tab "Yêu cầu tham gia" ở Cài đặt → Thành viên. Có thể chấp nhận hoặc từ chối từng yêu cầu. Người được chấp nhận sẽ tự động trở thành Thành viên.',
      },
      {
        title: 'Quyền truy cập dự án',
        content: 'Chủ sở hữu và Admin có thể đặt dự án là Riêng tư (chỉ thành viên được thêm mới có thể truy cập) hoặc Công khai (mọi người có thể xem và tham gia). Cài đặt này nằm trong phần chia sẻ ở header dự án.',
      },
    ],
  },
  {
    icon: <CalendarMonthOutlinedIcon fontSize="small" />,
    title: 'Lịch',
    items: [
      {
        title: 'Xem nhiệm vụ theo tháng',
        content: 'Trang Lịch hiển thị tất cả nhiệm vụ có deadline theo từng ngày trong tháng dưới dạng lưới. Mỗi ô ngày hiển thị các task có deadline vào ngày đó. Click vào task để mở modal chi tiết.',
      },
      {
        title: 'Điều hướng tháng',
        content: 'Dùng nút mũi tên trái/phải sát phần hiển thị tháng/năm để chuyển sang tháng trước/sau. Click "Hôm nay" để quay về tháng hiện tại — nút sẽ đổi màu xanh khi đang ở tháng hiện tại.',
      },
      {
        title: 'Lọc trên lịch',
        content: 'Dùng bộ lọc ở góc phải toolbar để lọc nhiệm vụ hiển thị trên lịch theo người thực hiện, độ ưu tiên hoặc trạng thái. Hữu ích khi muốn xem deadline của một người cụ thể.',
      },
    ],
  },
  {
    icon: <DownloadOutlinedIcon fontSize="small" />,
    title: 'Xuất dữ liệu',
    items: [
      {
        title: 'Xuất danh sách nhiệm vụ',
        content: 'Vào menu "⋯" trên toolbar → "Xuất dữ liệu Excel" để tải xuống toàn bộ danh sách nhiệm vụ dạng file .xlsx. File bao gồm các cột: ID, Tiêu đề, Trạng thái, Độ ưu tiên, Người thực hiện, Hạn hoàn thành (MM/DD/YYYY) và Ngày tạo (MM/DD/YYYY). Tên file được đặt theo tên dự án và ngày xuất.',
      },
      {
        title: 'Kết hợp với bộ lọc',
        content: 'Nếu đang bật "Ẩn nhiệm vụ hoàn thành", file xuất ra sẽ không bao gồm các task ở cột hoàn thành. Hữu ích khi bạn chỉ muốn báo cáo các công việc đang còn dang dở hoặc chia sẻ với người quản lý.',
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
          top: '50px',
          height: 'calc(100% - 50px)',
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

      {/* Quick tip */}
      <Box sx={{ mx: 2.5, my: 2, p: 1.5, bgcolor: '#eef0ff', borderRadius: '8px', border: '1px solid #c7d0ff' }}>
        <Typography fontSize={12} color="#4451d4">
          💡 Nhấn <strong>?</strong> bất kỳ lúc nào để mở/đóng panel trợ giúp này.
        </Typography>
      </Box>

      <Divider />

      {/* Sections */}
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

      {/* Footer */}
      <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid #f3f4f6', bgcolor: '#fafafa' }}>
        <Typography fontSize={11} color="#9ca3af" textAlign="center">
          Collab -  Project Management System · Phiên bản 1.0
        </Typography>
      </Box>
    </Drawer>
  );
}
