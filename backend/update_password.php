<?php
include __DIR__ . "/../db/koneksi.php";

$units = [
    'dpupkp1'   => 'dpupkp123',
    'dpupkp2'   => 'dpupkp123',
];

foreach ($units as $username => $plain_password) {
    $hashed_password = password_hash($plain_password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("UPDATE users SET password = ? WHERE username = ?");
    if (!$stmt) {
        echo "❌ Prepare failed for $username: " . htmlspecialchars($conn->error) . "<br>";
        continue;
    }

    $stmt->bind_param("ss", $hashed_password, $username);
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo "✅ Password untuk <strong>$username</strong> berhasil diperbarui.<br>";
        } else {
            $check = $conn->prepare("SELECT id FROM users WHERE username = ? LIMIT 1");
            $check->bind_param("s", $username);
            $check->execute();
            $res = $check->get_result();
            if ($res && $res->num_rows > 0) {
                echo "ℹ️ Username <strong>$username</strong> ditemukan tetapi password hash mungkin sama (tidak ada perubahan).<br>";
            } else {
                echo "⚠️ Username <strong>$username</strong> tidak ditemukan di tabel users.<br>";
            }
            $check->close();
        }
    } else {
        echo "❌ Gagal memperbarui $username: " . htmlspecialchars($stmt->error) . "<br>";
    }

    $stmt->close();
}

$conn->close();

echo "<br>-- Selesai --<br>";
echo "Catatan: hapus atau pindahkan file ini setelah selesai untuk keamanan.";
?>
