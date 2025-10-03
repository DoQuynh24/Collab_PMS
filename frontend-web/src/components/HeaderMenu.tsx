import { Box, IconButton, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { ProjectFormModal } from '../modules/project/component/ProjectFormModal'; 
interface MenuItemConfig {
  name: string;
  items: { name: string; status?: string }[];
}

export function HeaderMenu() {
  const [anchorEls, setAnchorEls] = useState<{ [key: string]: null | HTMLElement }>({
    Project: null,
    Dashboard: null,
  });
  const [openModal, setOpenModal] = useState(false); 

  const handleClick = (menuName: string) => (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEls((prev) => ({ ...prev, [menuName]: event.currentTarget }));
  };

  const handleClose = (menuName: string) => () => {
    setAnchorEls((prev) => ({ ...prev, [menuName]: null }));
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const menuItems: MenuItemConfig[] = [
    {
      name: 'Project',
      items: [
        { name: 'Contract Management System (CMS)', status: 'In Review' },
        { name: 'Software', status: 'Updated' },
        { name: 'Business', status: '' },
      ],
    },
    {
      name: 'Dashboard',
      items: [
        { name: 'Overview', status: '' },
        { name: 'Reports', status: 'In Progress' },
      ],
    },
  ];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ml: 10 }}>
      {menuItems.map((menu) => (
        <Box key={menu.name} sx={{ ml: 1 }}>
          <IconButton
            color="inherit"
            onClick={handleClick(menu.name)}
            sx={{ p: 0.5, fontSize: '16px' }}
            aria-controls={`menu-${menu.name}`}
            aria-haspopup="true"
          >
            {menu.name}
            <ArrowDropDownIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEls[menu.name]}
            open={Boolean(anchorEls[menu.name])}
            onClose={handleClose(menu.name)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            {menu.items.map((item) => (
              <MenuItem key={item.name} onClick={handleClose(menu.name)}>
                {item.name} {item.status && `- ${item.status}`}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      ))}
      <IconButton
        color="inherit"
        onClick={handleOpenModal}
        sx={{ p: 0.5, fontSize: '16px', ml: 1 }}
      >
        Create
      </IconButton>
      <ProjectFormModal open={openModal} onClose={handleCloseModal} /> {/* Sử dụng component modal */}
    </Box>
  );
}