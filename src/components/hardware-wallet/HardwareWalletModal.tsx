import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import TrezorConnect from "@trezor/connect-web";
import { Buffer } from "buffer";

// Add Buffer polyfill to window object
if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || Buffer;
}

const walletOptions = [
  {
    name: "Ledger",
    icon: "/images/icons/ledger-logo.svg",
    id: "ledger",
  },
  {
    name: "Trezor",
    icon: "/images/icons/trezor-logo.svg",
    id: "trezor",
  },
];

interface HardwareWalletModalProps {
  open: boolean;
  onClose: () => void;
}

const HardwareWalletModal: React.FC<HardwareWalletModalProps> = ({
  open,
  onClose,
}) => {
  const [connecting, setConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectedWallet, setSelectedWallet] = useState<string>("");

  useEffect(() => {
    const initTrezor = async () => {
      try {
        await TrezorConnect.init({
          lazyLoad: true,
          manifest: {
            email: "your-email@example.com",
            appUrl: window.location.origin,
          },
        });
      } catch (err) {
        console.error("Failed to initialize Trezor:", err);
      }
    };

    initTrezor();

    return () => {
      TrezorConnect.dispose();
    };
  }, []);

  const handleLedgerConnection = async () => {
    setConnecting(true);
    setError("");

    try {
      const TransportWebUSB = (await import("@ledgerhq/hw-transport-webusb"))
        .default;
      const { default: Eth } = await import("@ledgerhq/hw-app-eth");

      const transport = await TransportWebUSB.create();
      const eth = new Eth(transport);

      try {
        const result = await eth.getAddress("44'/60'/0'/0/0");
        console.log("Ledger connected:", result);
        onClose();
      } catch (innerError) {
        console.error("Error getting Ethereum address:", innerError);
        setError(
          "Please make sure the Ethereum app is open on your Ledger device."
        );
      } finally {
        // Always close the transport
        await transport.close();
      }
    } catch (err) {
      console.error("Ledger connection error:", err);
      let errorMessage = "Failed to connect to Ledger. ";

      if (err instanceof Error && err.name === "TransportOpenUserCancelled") {
        errorMessage += "Connection was cancelled.";
      } else if (
        err instanceof Error &&
        err.name === "TransportWebUSBGestureRequired"
      ) {
        errorMessage += "Please click the connect button again.";
      } else if (
        err instanceof Error &&
        err.message.includes("Unable to claim interface")
      ) {
        errorMessage +=
          "Please make sure your Ledger is not in use by another application.";
      } else {
        errorMessage +=
          "Please ensure your device is connected, unlocked, and has the Ethereum app open.";
      }

      setError(errorMessage);
    } finally {
      setConnecting(false);
    }
  };

  const handleTrezorConnection = async () => {
    setConnecting(true);
    setError("");
    try {
      const result = await TrezorConnect.ethereumGetAddress({
        path: "m/44'/60'/0'/0/0",
        showOnTrezor: true,
      });

      if (result.success) {
        console.log("Trezor connected:", result.payload);
        onClose();
      } else {
        throw new Error(result.payload.error);
      }
    } catch (err) {
      console.error("Trezor connection error:", err);
      setError(
        "Failed to connect to Trezor. Please make sure your device is connected and try again."
      );
    } finally {
      setConnecting(false);
    }
  };

  const handleWalletSelect = async (walletId: React.SetStateAction<string>) => {
    setSelectedWallet(walletId);
    if (walletId === "ledger") {
      await handleLedgerConnection();
    } else if (walletId === "trezor") {
      await handleTrezorConnection();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !connecting && onClose()}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h5" component="div">
          Connect Hardware Wallet
        </Typography>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Box sx={{ mb: 2, p: 2, bgcolor: "error.light", borderRadius: 1 }}>
            <Typography color="error.dark">{error}</Typography>
          </Box>
        )}
        <List>
          {walletOptions.map((wallet) => (
            <ListItem key={wallet.id} disablePadding>
              <ListItemButton
                onClick={() => handleWalletSelect(wallet.id)}
                disabled={connecting}
                selected={selectedWallet === wallet.id}
              >
                <ListItemIcon sx={{ minWidth: 60 }}>
                  <img
                    src={wallet.icon}
                    alt={wallet.name}
                    width={48}
                    height={48}
                    style={{
                      objectFit: "contain",
                      filter:
                        connecting && selectedWallet === wallet.id
                          ? "grayscale(100%)"
                          : "none",
                      opacity:
                        connecting && selectedWallet !== wallet.id ? 0.5 : 1,
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={wallet.name}
                  secondary={
                    connecting && selectedWallet === wallet.id
                      ? "Connecting..."
                      : "Click to connect"
                  }
                />
                {connecting && selectedWallet === wallet.id && (
                  <CircularProgress size={24} sx={{ ml: 2 }} />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default HardwareWalletModal;
