<?php
require_once __DIR__ . '/../config/database.php';

class User {
    public static function findByEmail($email) {
        $db = get_db();
        $stmt = $db->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $email]);
        return $stmt->fetch();
    }

    public static function findById($id) {
        $db = get_db();
        $stmt = $db->prepare("SELECT * FROM users WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    public static function create($data) {
        $db = get_db();
        $sql = "INSERT INTO users (first_name, last_name, email, password_hash, role, avatar, student_id, bio, contact_info, year_level, section, gender, birthdate, created_at)
                VALUES (:first_name,:last_name,:email,:password_hash,:role,:avatar,:student_id,:bio,:contact_info,:year_level,:section,:gender,:birthdate,NOW())";
        $stmt = $db->prepare($sql);
        $stmt->execute($data);
        return $db->lastInsertId();
    }

    public static function update($id, $fields) {
        $db = get_db();
        $set = [];
        $params = [':id' => $id];
        foreach ($fields as $k => $v) {
            $set[] = "`$k` = :$k";
            $params[":$k"] = $v;
        }
        $sql = "UPDATE users SET " . implode(',', $set) . " WHERE id = :id";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
    }
}