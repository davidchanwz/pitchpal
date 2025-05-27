'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  User, 
  Settings, 
  HelpCircle, 
  LogOut,
  Sparkles 
} from 'lucide-react';

interface FloatingNavbarProps {
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onHelpClick?: () => void;
  onLogoutClick?: () => void;
  userName?: string;
  isProcessing?: boolean;
}

export default function FloatingNavbar({
  onProfileClick,
  onSettingsClick,
  onHelpClick,
  onLogoutClick: propLogoutClick,
  userName = "Demo User",
  isProcessing = false
}: FloatingNavbarProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
    router.refresh();
  };

  // Use provided logout handler or default to supabase signout
  const onLogoutClick = propLogoutClick || handleSignOut;
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-6 left-0 right-0 z-50 mx-auto w-fit mt-6"
    >
      <motion.div
        className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-full px-6 py-3 shadow-lg"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center space-x-1">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PitchPal
              </span>
            </div>
            {isProcessing && (
              <Badge variant="secondary" className="animate-pulse">
                Processing
              </Badge>
            )}
          </motion.div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-2">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={onProfileClick}
                className="rounded-full"
              >
                <User className="h-4 w-4 mr-2" />
                {userName}
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSettingsClick}
                className="rounded-full"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={onHelpClick}
                className="rounded-full"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogoutClick}
                className="rounded-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
}
