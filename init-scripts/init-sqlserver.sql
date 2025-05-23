USE master;
GO

-- Tạo databases với tên đúng như application config
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'product_catalog')
BEGIN
    CREATE DATABASE product_catalog;
END
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'users')
BEGIN
    CREATE DATABASE users;
END
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'cart')
BEGIN
    CREATE DATABASE cart;
END
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'orders')
BEGIN
    CREATE DATABASE orders;
END
GO

PRINT 'All databases created successfully!';
