import { Box, Modal, Typography, Button } from '@mui/material';
import { useState } from 'react';

interface ProjectFormModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProjectFormModal({ open, onClose }: ProjectFormModalProps) {
  const [projectName, setProjectName] = useState('');

  const handleSubmit = () => {
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="project-form-modal"
      aria-describedby="project-form-modal-description"
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        p: 2,
      }}
    >
      <Box
        sx={{
          width: 300,
          bgcolor: 'background.paper',
          p: 2,
          borderRadius: 1,
          boxShadow: 24,
        }}
      >
        <Typography id="project-form-modal" variant="h6" component="h2">
          Create New Project
        </Typography>
        <Box sx={{ mt: 2 }}>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project name"
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <Button variant="contained" onClick={handleSubmit} sx={{ mr: 1 }}>
            Save
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}