# Sơ đồ Database (ERD) - Sweet Recipes App

Tài liệu chi tiết CSDL MongoDB cho dự án Sweet Recipes.

## Sơ đồ ERD

```mermaid
erDiagram
    User ||--o{ Recipe : "creates (author)"
    User ||--o{ Favorite : "saves"
    User ||--o{ Comment : "posts"
    User ||--o{ MealPlan : "plans"
    User ||--o{ NutritionLog : "logs"
    User ||--o{ ShoppingList : "manages"
    User ||--o{ Notification : "receives (recipient)"
    User ||--o{ Notification : "triggers (sender)"
    User ||--o{ User : "follows / following"

    Category ||--o{ Recipe : "categorizes"

    Recipe ||--o{ Favorite : "is favorited in"
    Recipe ||--o{ Comment : "receives"
    Recipe ||--o{ MealPlan : "included in"
    Recipe ||--o{ NutritionLog : "referenced in"
    Recipe ||--o{ Notification : "related to"

    User {
        ObjectId _id PK
        String username
        String email
        String password
        String avatar
        String coverImage
        String bio
        ObjectId_Array createdRecipes FK
        ObjectId_Array favoriteRecipes FK
        ObjectId_Array followers FK
        ObjectId_Array following FK
        Enum role "user | admin"
        Enum status "active | blocked"
        Number dailyCalorieGoal
        Date createdAt
        Date updatedAt
    }

    Recipe {
        ObjectId _id PK
        String title
        String description
        String image
        ObjectId category FK
        String_Array ingredients
        String_Array instructions
        Number cookingTime
        Enum difficulty "Dễ | Trung bình | Khó"
        Number calories
        ObjectId author FK
        Enum status "pending | approved | rejected"
        Date createdAt
        Date updatedAt
    }

    Category {
        ObjectId _id PK
        String name
        String image
        Date createdAt
        Date updatedAt
    }

    Favorite {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId recipeId FK
        Date createdAt
        Date updatedAt
    }

    Comment {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId recipeId FK
        String content
        Date createdAt
        Date updatedAt
    }

    MealPlan {
        ObjectId _id PK
        ObjectId user FK
        ObjectId recipe FK
        String date "YYYY-MM-DD"
        String time "HH:MM"
        Date createdAt
        Date updatedAt
    }

    NutritionLog {
        ObjectId _id PK
        ObjectId user FK
        ObjectId recipe FK
        String recipeTitle
        Number calories
        Enum mealType "Sáng | Trưa | Tối | Ăn vặt"
        Date date
        String dayString "YYYY-MM-DD"
        Date createdAt
        Date updatedAt
    }

    ShoppingList {
        ObjectId _id PK
        ObjectId userId FK
        String name
        String amount
        String recipeTitle
        Boolean isBought
        Date createdAt
        Date updatedAt
    }

    Notification {
        ObjectId _id PK
        ObjectId recipient FK
        ObjectId sender FK
        Enum type "follow | like | comment"
        ObjectId recipe FK
        String content
        Boolean isRead
        Date createdAt
        Date updatedAt
    }
```

---

## Danh sách các Collections

1. **User**: Quản lý thông tin người dùng, vai trò, trạng thái, danh sách làm theo/theo dõi, danh sách món đã tạo & yêu thích.
2. **Recipe**: Lưu thông tin công thức làm bánh ngọt, nguyên liệu, quy trình, độ khó, calo, tác giả và trạng thái phê duyệt.
3. **Category**: Danh mục loại món ăn (Ví dụ: Bánh ngọt, Chè, Đồ uống,...).
4. **Favorite**: Bảng liên kết lưu danh sách các công thức yêu thích của từng người dùng.
5. **Comment**: Các bình luận của người dùng trên các bài đăng công thức.
6. **MealPlan**: Lịch trình bữa ăn đã lên kế hoạch theo ngày và giờ.
7. **NutritionLog**: Nhật ký nạp calo theo ngày (bữa sáng, trưa, tối, ăn vặt).
8. **ShoppingList**: Danh sách đồ cần mua khi đi chợ làm bánh.
9. **Notification**: Hệ thống thông báo khi có người theo dõi, tim bài hoặc bình luận.
