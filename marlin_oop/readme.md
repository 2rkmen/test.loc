#курс мерлина про ооп

## что нужно:

 - жесткая концентрация
 - дохулион повторений
 
---
объект определяется

атрибуты - свойства(размер, цвет, скорость)

поведение - методы(бегать, прыгать, читать)

у любого объекта есть цель, для которой он создавался. Дальше легче определить набор
свойств и методов.

пример: объект - автобус.

цель: транспортировка людей из точки а в точку б

жизненый цикл:

- открыть двери
- закрыть двери
- завести мотор
- ехать
- поворачивать
- остановиться
- открыть двери
- закрыть двери

---
### дз1
план:
1. выбрать объект и определить его цель
2. составить минимальный список атрибутов и поведений
3. пропустить готовый объект через его жизненный цикл

набросать и выполнить план с 10 объектами

#### пользователь
- пользователь логинится по логину-паролю
- видит свои объекты
- видит дашбоард со своими объектами
- обращается в чате в тп
- заглядывает в документооборот
- управляет настройками
- управляет внутренним счетом
- получает список машин
- список своих сотрудников, прошедших обучение
- может переходить в наши сервисы(мониторинг, завгар , др.)
- 


#### обращение на саппорт
цель: решение проблемы пользователя, путем обращения к менеджеру поддержки

свойства:
- id обращения
- дата создания
- направление(продукт)
- события по обращению(сообщения от саппорта, комментарии пользователя) - еще объект? 1-много
- статус обращения
- оценка по обращению?
- 
методы:
- новое обращение
- отправить
- саппорт берет в работу
- уточняющий вопрос саппорта
- коммент клиента
- ответ саппорта
- закрытие тикета клиентом
- оценка обращения


#### счет
цель: создание, отправка, сохранение, печать счетов
свойства: 
- id
- номер
- реквизиты счета
- статус

методы:
- создать
- отправить
- скачать
- удалить

жизненный цикл:
- 