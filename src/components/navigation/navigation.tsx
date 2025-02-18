import React, { FC, useState } from "react";
import Box from "@mui/material/Box";
import { navigations } from "./navigation.data";
import { Link } from "@mui/material";
import { useLocation } from "react-router-dom";
import HardwareWalletModal from "../hardware-wallet/HardwareWalletModal";

type NavigationData = {
  path: string;
  label: string;
};

const Navigation: FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const handleWalletConnect = () => {
    setWalletModalOpen(true);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexFlow: "wrap",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 2,
        flexDirection: { xs: "column", lg: "row" },
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          alignItems: "center",
          gap: { xs: 2, lg: 4 },
        }}
      >
        {navigations.map(({ path: destination, label }: NavigationData) => (
          <Box
            key={label}
            component={Link}
            href={destination}
            sx={{
              display: "inline-flex",
              position: "relative",
              color: currentPath === destination ? "" : "white",
              lineHeight: "30px",
              letterSpacing: "3px",
              cursor: "pointer",
              textDecoration: "none",
              textTransform: "uppercase",
              fontWeight: 700,
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              ...(destination === "/" && { color: "primary.main" }),
              "& > div": { display: "none" },
              "&.current>div": { display: "block" },
              "&:hover": {
                color: "text.disabled",
              },
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 12,
                transform: "rotate(3deg)",
                "& img": { width: 44, height: "auto" },
              }}
            >
              <img src="/images/headline-curve.svg" alt="Headline curve" />
            </Box>
            {label}
          </Box>
        ))}
      </Box>

      <Box
        onClick={handleWalletConnect}
        sx={{
          color: "white",
          cursor: "pointer",
          textDecoration: "none",
          textTransform: "uppercase",
          fontWeight: 400,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          lineHeight: "45px",
          width: "344px",
          height: "55px",
          borderRadius: "6px",
          backgroundColor: "#00dbe3",
          transition: "background-color 0.2s ease",
          ml: { lg: 2 },
          "&:hover": {
            backgroundColor: "#00c4cc",
          },
        }}
      >
        Connect Hardware Wallet
      </Box>

      <HardwareWalletModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />
    </Box>
  );
};

export default Navigation;
