"use client";
import { useState, useEffect } from "react";
import { Modal, Button } from "antd";

export default function ModalImages() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);

  // 🟢 Auto open only once
  useEffect(() => {
    setOpen(true);
  }, []);

  const images = [
    "/images/zurag2.jpg",
    "/images/zurag1.jpg"
  ];

  const next = () => {
    setPage((prev) => (prev + 1) % images.length);
  };

  const prev = () => {
    setPage((prev) => (prev - 1 + images.length) % images.length);
  };

  // 🟢 5 секунд тутам автоматаар солигдох
  useEffect(() => {
    if (!open) return;

    const interval = setInterval(() => {
      setPage((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [open]);

  return (
    <>
      <Modal
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
        width={700}
        centered
        style={{ padding: 0, zIndex: 999999, borderRadius: 8 }}
      >
        <div style={{ textAlign: "center" }}>
          <img
            src={images[page]}
            style={{ width: "100%", borderRadius: 8 }}
            alt="modal-img"
          />

          {/* <div style={{ marginTop: 10, fontSize: 14 }}>
            {page + 1} / {images.length}
          </div> */}
        </div>
      </Modal>
    </>
  );
}
