import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Путь к Excel файлам - исправленный путь
let excelDir = path.join(__dirname, '../data/excel');

// Ключевые слова для поиска колонок
const COLUMN_MAP = {
  region: ["наименование муниципального района", "район", "муниципальный", "муниципальное"],
  position: ["должность", "должн", "предмет", "вакансия", "наименование должности"],
  school: ["образовательная организация", "школа", "оо", "учреждение", "наименование оо"],
  hours: ["нагрузка", "час", "ставка", "нагрузка (час)", "часы"],
  salary: ["зарплата", "зп", "оклад", "оплата", "заработная", "размер"],
  housing: ["жилье", "общежитие", "вид предост. жилья", "предоставление жилья", "жилищные"],
  benefits: ["льготы", "преференции", "имеющиеся льготы в мр", "социальные"],
  contacts: ["контакт", "телефон", "фио", "контактные телефоны", "руководитель"],
  email: ["email", "почта", "эл.почта", "адрес эл.почты", "электронная"],
  support: ["поддержка", "меры поддержки", "дополнительные меры", "поддержка"],
  studentEmployment: ["студент", "трудоустройство", "старший курс", "выпускник"],
  duties: ["обязанности", "функции", "обязанности (кратко)", "должностные"],
  openDate: ["дата", "открытие", "дата открытия вакансии", "создания"],
};

// Функция для поиска колонки по ключевым словам
function findColumnIndex(headers, keywords) {
  if (!headers || !Array.isArray(headers)) return -1;

  const normalizedHeaders = headers.map(h => String(h).toLowerCase().trim());

  for (const keyword of keywords) {
    for (let i = 0; i < normalizedHeaders.length; i++) {
      if (normalizedHeaders[i].includes(keyword.toLowerCase())) {
        return i;
      }
    }
  }
  return -1;
}

// Функция для нормализации значения даты
function normalizeDate(dateValue) {
  if (!dateValue) return "";
  
  try {
    // Если это объект даты из Excel
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString('ru-RU');
    }
    
    // Если это число (Excel timestamp)
    if (typeof dateValue === 'number') {
      const date = new Date((dateValue - 25569) * 86400 * 1000);
      return date.toLocaleDateString('ru-RU');
    }
    
    // Если это строка
    const str = String(dateValue).trim();
    if (str && !isNaN(new Date(str).getTime())) {
      return new Date(str).toLocaleDateString('ru-RU');
    }
    
    return str;
  } catch (error) {
    return String(dateValue);
  }
}

// Функция для чтения одного Excel-файла
function parseExcelFile(filePath) {
  try {
    console.log(`📖 Чтение файла: ${path.basename(filePath)}`);
    
    const workbook = XLSX.readFile(filePath, { 
      cellDates: true,
      cellText: false,
      cellNF: false 
    });
    const jobs = [];

    // Проверяем наличие листа "ОО" или используем первый лист
    const sheetName = workbook.SheetNames.find(name => 
      name.toLowerCase().includes('оо') || name.toLowerCase().includes('вакансии')
    ) || workbook.SheetNames[0];

    if (!sheetName) {
      console.log(`❌ Подходящий лист не найден в файле ${path.basename(filePath)}`);
      return jobs;
    }

    const sheet = workbook.Sheets[sheetName];
    
    if (!sheet || !sheet['!ref']) {
      console.log(`❌ Пустой лист в файле ${path.basename(filePath)}`);
      return jobs;
    }

    const range = XLSX.utils.decode_range(sheet['!ref']);
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

    if (jsonData.length === 0) {
      console.log(`❌ Нет данных в файле ${path.basename(filePath)}`);
      return jobs;
    }

    // Ищем строку с заголовками
    let headerRowIndex = -1;
    let headers = [];

    for (let row = 0; row < Math.min(jsonData.length, 15); row++) {
      const rowData = jsonData[row] || [];
      const rowString = rowData.map(cell => String(cell).toLowerCase()).join(' ');

      // Проверяем, есть ли в строке ключевые заголовки
      const hasPosition = rowString.includes('должность');
      const hasSchool = rowString.includes('образовательная') || rowString.includes('школа') || rowString.includes('оо');

      if (hasPosition && hasSchool) {
        headerRowIndex = row;
        headers = rowData;
        break;
      }
    }

    if (headerRowIndex === -1 && jsonData.length > 0) {
      // Используем первую строку как заголовки
      headerRowIndex = 0;
      headers = jsonData[0];
      console.log(`⚠️ Используем первую строку как заголовки в ${path.basename(filePath)}`);
    }

    if (headerRowIndex === -1) {
      console.log(`❌ Заголовки не найдены в файле ${path.basename(filePath)}`);
      return jobs;
    }

    // Определяем индексы колонок
    const columnIndexes = {};
    for (const [key, keywords] of Object.entries(COLUMN_MAP)) {
      columnIndexes[key] = findColumnIndex(headers, keywords);
    }

    console.log(`📊 Найдены колонки в ${path.basename(filePath)}:`, 
      Object.fromEntries(Object.entries(columnIndexes).filter(([_, idx]) => idx !== -1))
    );

    // Читаем данные
    for (let row = headerRowIndex + 1; row < jsonData.length; row++) {
      const rowData = jsonData[row] || [];

      // Извлекаем данные по колонкам
      const region = columnIndexes.region >= 0 ? String(rowData[columnIndexes.region] || "").trim() : "";
      const position = columnIndexes.position >= 0 ? String(rowData[columnIndexes.position] || "").trim() : "";
      const school = columnIndexes.school >= 0 ? String(rowData[columnIndexes.school] || "").trim() : "";

      // Пропускаем пустые строки
      if (!position && !school && !region) continue;

      const job = {
        id: `${path.basename(filePath, ".xlsx")}-${row + 1}`,
        region: region || path.basename(filePath, ".xlsx").replace('.xlsx', ''),
        position: position || "Должность не указана",
        school: school || "Школа не указана",
        hours: columnIndexes.hours >= 0 ? String(rowData[columnIndexes.hours] || "").trim() : "",
        salary: columnIndexes.salary >= 0 ? String(rowData[columnIndexes.salary] || "").trim() : "",
        housing: columnIndexes.housing >= 0 ? String(rowData[columnIndexes.housing] || "").trim() : "",
        benefits: columnIndexes.benefits >= 0 ? String(rowData[columnIndexes.benefits] || "").trim() : "",
        contacts: columnIndexes.contacts >= 0 ? String(rowData[columnIndexes.contacts] || "").trim() : "",
        email: columnIndexes.email >= 0 ? String(rowData[columnIndexes.email] || "").trim() : "",
        support: columnIndexes.support >= 0 ? String(rowData[columnIndexes.support] || "").trim() : "",
        studentEmployment: columnIndexes.studentEmployment >= 0 ? String(rowData[columnIndexes.studentEmployment] || "").trim() : "",
        duties: columnIndexes.duties >= 0 ? String(rowData[columnIndexes.duties] || "").trim() : "",
        openDate: columnIndexes.openDate >= 0 ? normalizeDate(rowData[columnIndexes.openDate]) : "",
      };

      // Фильтруем пустые значения
      Object.keys(job).forEach(key => {
        if (job[key] === "" || job[key] === "undefined") {
          job[key] = "";
        }
      });

      jobs.push(job);
    }

    console.log(`✅ ${path.basename(filePath)} — найдено ${jobs.length} вакансий`);
    return jobs;

  } catch (error) {
    console.error(`❌ Ошибка чтения файла ${filePath}:`, error.message);
    return [];
  }
}

// Основная функция для получения всех вакансий
function getJobs() {
  console.log('🔍 Поиск Excel файлов в:', excelDir);

  try {
    if (!fs.existsSync(excelDir)) {
      console.error("❌ Папка с Excel не найдена:", excelDir);
      
      // Попробуем найти папку data
      const possiblePaths = [
        './data/excel',
        '../data/excel', 
        '../../data/excel',
        './server/data/excel',
        path.join(process.cwd(), 'data/excel'),
        path.join(__dirname, '../../../data/excel')
      ];

      for (const possiblePath of possiblePaths) {
        const fullPath = path.resolve(possiblePath);
        console.log(`🔍 Проверяем путь: ${fullPath}`);
        if (fs.existsSync(fullPath)) {
          console.log(`✅ Найдена папка по пути: ${fullPath}`);
          excelDir = fullPath;
          break;
        }
      }
    }

    if (!fs.existsSync(excelDir)) {
      console.error("❌ Папка с Excel не найдена после поиска");
      // Возвращаем тестовые данные если файлов нет
      return [
        {
          id: "test-1",
          position: "Учитель математики",
          school: "Тестовая школа №1",
          region: "Тестовый регион",
          hours: "18 часов",
          salary: "45000 руб.",
          housing: "Предоставляется общежитие",
          benefits: "Социальный пакет",
          contacts: "+7 (999) 123-45-67",
          email: "school1@example.com"
        }
      ];
    }

    const files = fs.readdirSync(excelDir).filter(f => f.endsWith(".xlsx"));
    console.log(`📁 Найдено ${files.length} Excel файлов`);

    let allJobs = [];

    files.forEach(file => {
      const filePath = path.join(excelDir, file);
      const jobs = parseExcelFile(filePath);
      allJobs = allJobs.concat(jobs);
    });

    console.log(`🎉 Итого загружено ${allJobs.length} вакансий из ${files.length} файлов`);
    
    // Сохраняем в JSON для отладки
    if (allJobs.length > 0) {
      const debugPath = path.join(__dirname, '../jobs-debug.json');
      fs.writeFileSync(debugPath, JSON.stringify(allJobs.slice(0, 10), null, 2));
      console.log(`📝 Пример данных сохранен в: ${debugPath}`);
    }
    
    return allJobs;

  } catch (error) {
    console.error('❌ Критическая ошибка в getJobs:', error);
    // Возвращаем тестовые данные при ошибке
    return [
      {
        id: "error-1",
        position: "Учитель математики",
        school: "Резервная школа",
        region: "Резервный регион",
        hours: "20 часов",
        salary: "40000 руб.",
        housing: "По договоренности",
        benefits: "Стандартный соцпакет",
        contacts: "Резервный контакт",
        email: "reserve@example.com"
      }
    ];
  }
}

export { getJobs };