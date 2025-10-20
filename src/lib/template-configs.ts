export interface TemplatePosition {
  x: number;
  y: number;
  size: number;
  color: string;
  align: "left" | "center" | "right";
  font: string;
}

export interface TemplateConfig {
  templatePath: string;
  name: string;
  defaultPositions: {
    title: TemplatePosition;
    description: TemplatePosition;
    date: TemplatePosition;
    number: TemplatePosition;
    expired: TemplatePosition;
  };
  
  
  
}

// Konfigurasi template dengan default positions
export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  "certificate/kunjungan_industri/industri1.png": {
    templatePath: "certificate/kunjungan_industri/industri1.png",
    name: "Industrial Visit Template 1",
    defaultPositions: {
      title: { 
        x: 667,
        y: 625, 
        size: 30, 
        color: "#000000", 
        align: "center", 
        font: "Times New Roman, Times, serif" 
      },
      description: { 
        x: 665,
        y: 861, 
        size: 13, 
        color: "#000000", 
        align: "center", 
        font: "Inter, ui-sans-serif, system-ui" 
      },
      date: { 
        x: 367, 
        y: 1099, 
        size: 11, 
        color: "#000000", 
        align: "center", 
        font: "Inter, ui-sans-serif, system-ui" 
      },
      number: {
        x: 1675,
        y: 87,
        size: 14,
        color: "#000000",
        align: "center",
        font: "Inter, ui-sans-serif, system-ui"
      },
      expired: {
        x: 1371,
        y: 1099,
        size: 12,
        color: "#000000",
        align: "center",
        font: "Inter, ui-sans-serif, system-ui"
      }
    }
  },
  "certificate/kunjungan_industri/industri2.png": {
    templatePath: "certificate/kunjungan_industri/industri2.png",
    name: "Industrial Visit Template 2",
    defaultPositions: {
      title: { 
        x: 461,
        y: 819, 
        size: 29, 
        color: "#259e8f", 
        align: "center", 
        font: "Georgia, serif" 
      },
      description: { 
        x: 406, 
        y: 1052, 
        size: 16, 
        color: "#333333", 
        align: "center", 
        font: "Inter, ui-sans-serif, system-ui" 
      },
      date: { 
        x: 904, 
        y: 1682, 
        size: 15, 
        color: "#666666", 
        align: "right", 
        font: "Arial, Helvetica, sans-serif" 
      },
      number: {
        x: 1125,
        y: 200,
        size: 20,
        color: "#333333",
        align: "center",
        font: "Inter, ui-sans-serif, system-ui"
      },
      expired: {
        x: 276,
        y: 1682,
        size: 15,
        color: "#333333",
        align: "center",
        font: "Inter, ui-sans-serif, system-ui"
      }
    }
  },
  "certificate/magang/magang1.png": {
    templatePath: "certificate/magang/magang1.png",
    name: "Internship Template 1",
    defaultPositions: {
      title: { 
        x: 350, 
        y: 190, 
        size: 30, 
        color: "#000000", 
        align: "center", 
        font: "Times New Roman, Times, serif" 
      },
      description: { 
        x: 340, 
        y: 240, 
        size: 16, 
        color: "#000000", 
        align: "center", 
        font: "Arial, Helvetica, sans-serif" 
      },
      date: { 
        x: 60, 
        y: 100, 
        size: 13, 
        color: "#000000", 
        align: "left", 
        font: "Arial, Helvetica, sans-serif" 
      },
      number: {
        x: 350,
        y: 300,
        size: 14,
        color: "#000000",
        align: "center",
        font: "Inter, ui-sans-serif, system-ui"
      },
      expired: {
        x: 350,
        y: 360,
        size: 12,
        color: "#000000",
        align: "center",
        font: "Inter, ui-sans-serif, system-ui"
      }
    }
  },
  "certificate/magang/magang2.png": {
    templatePath: "certificate/magang/magang2.png",
    name: "Internship Template 2",
    defaultPositions: {
      title: { 
        x: 350, 
        y: 190, 
        size: 30, 
        color: "#000000", 
        align: "center", 
        font: "Times New Roman, Times, serif" 
      },
      description: { 
        x: 340, 
        y: 240, 
        size: 16, 
        color: "#000000", 
        align: "center", 
        font: "Arial, Helvetica, sans-serif" 
      },
      date: { 
        x: 60, 
        y: 100, 
        size: 13, 
        color: "#000000", 
        align: "left", 
        font: "Arial, Helvetica, sans-serif" 
      },
      number: {
        x: 350,
        y: 300,
        size: 14,
        color: "#000000",
        align: "center",
        font: "Inter, ui-sans-serif, system-ui"
      },
      expired: {
        x: 350,
        y: 360,
        size: 12,
        color: "#000000",
        align: "center",
        font: "Inter, ui-sans-serif, system-ui"
      }
    }
  },
  "certificate/mou/mou1.png": {
    templatePath: "certificate/mou/mou1.png",
    name: "MoU Template 1",
    defaultPositions: {
      title: { 
        x: 380, 
        y: 170, 
        size: 34, 
        color: "#000000", 
        align: "center", 
        font: "Georgia, serif" 
      },
      description: { 
        x: 370, 
        y: 220, 
        size: 15, 
        color: "#000000", 
        align: "center", 
        font: "Times New Roman, Times, serif" 
      },
      date: { 
        x: 80, 
        y: 130, 
        size: 14, 
        color: "#000000", 
        align: "center", 
        font: "Times New Roman, Times, serif" 
      },
      number: {
        x: 380,
        y: 300,
        size: 14,
        color: "#000000",
        align: "center",
        font: "Inter, ui-sans-serif, system-ui"
      },
      expired: {
        x: 380,
        y: 360,
        size: 12,
        color: "#000000",
        align: "center",
        font: "Inter, ui-sans-serif, system-ui"
      }
    }
  },
  "certificate/mou/mou2.png": {
    templatePath: "certificate/mou/mou2.png",
    name: "MoU Template 2",
    defaultPositions: {
      title: { 
        x: 380, 
        y: 170, 
        size: 34, 
        color: "#000000", 
        align: "center", 
        font: "Georgia, serif" 
      },
      description: { 
        x: 370, 
        y: 220, 
        size: 15, 
        color: "#000000", 
        align: "center", 
        font: "Times New Roman, Times, serif" 
      },
      date: { 
        x: 80, 
        y: 130, 
        size: 14, 
        color: "#000000", 
        align: "center", 
        font: "Times New Roman, Times, serif" 
      },
      number: {
        x: 380,
        y: 300,
        size: 14,
        color: "#000000",
        align: "center",
        font: "Inter, ui-sans-serif, system-ui"
      },
      expired: {
        x: 380,
        y: 360,
        size: 12,
        color: "#000000",
        align: "center",
        font: "Inter, ui-sans-serif, system-ui"
      }
    }
  },
  "certificate/pelatihan/pelatihan1.png": {
    templatePath: "certificate/pelatihan/pelatihan1.png",
    name: "Training Template 1",
    defaultPositions: {
      title: { 
        x: 715, 
        y: 562, 
        size: 31, 
        color: "#26786e", 
        align: "center", 
        font: "Arial, ui-sans-serif, system-ui" 
      },
      description: { 
        x: 862, 
        y: 747, 
        size: 15, 
        color: "#26786e", 
        align: "center", 
        font: "Arial, ui-sans-serif, system-ui" 
      },
      date: { 
        x: 855, 
        y: 1203, 
        size: 13, 
        color: "#26786e", 
        align: "center", 
        font: "Arial, ui-sans-serif, system-ui" 
      },
      number: {
        x: 908,
        y: 26,
        size: 14,
        color: "#26786e",
        align: "center",
        font: "Arial, ui-sans-serif, system-ui"
      },
      expired: {
        x: 862,
        y: 1269,
        size: 12,
        color: "#26786e",
        align: "center",
        font: "Arial, ui-sans-serif, system-ui"
      }
    }
  },
  "certificate/pelatihan/pelatihan2.png": {
    templatePath: "certificate/pelatihan/pelatihan2.png",
    name: "Training Template 2",
    defaultPositions: {
      title: { 
        x: 397,
        y: 1098, 
        size: 38, 
        color: "#c9ac17", 
        align: "center", 
        font: "Times New Roman, ui-sans-serif, system-ui" 
      },
      description: { 
        x: 414, 
        y: 1258, 
        size: 15, 
        color: "#868dad", 
        align: "center", 
        font: "Inter, ui-sans-serif, system-ui" 
      },
      date: { 
        x: 583,
        y: 1682, 
        size: 13, 
        color: "#868dad", 
        align: "center", 
        font: "Arial, ui-sans-serif, system-ui" 
      },
      number: {
        x: 1162,
        y: 93,
        size: 13,
        color: "#c9ac17",
        align: "center",
        font: "Inter, ui-sans-serif, system-ui"
      },
      expired: {
        x: 592,
        y: 1733,
        size: 12,
        color: "#868dad",
        align: "center",
        font: "Arial, ui-sans-serif, system-ui"
      }
    }
  },
};

// Fungsi untuk mendapatkan konfigurasi template berdasarkan path
export function getTemplateConfig(templatePath: string): TemplateConfig | null {
  return TEMPLATE_CONFIGS[templatePath] || null;
}

// Fungsi untuk mendapatkan semua template configs untuk kategori tertentu
export function getTemplateConfigsForCategory(category: string): TemplateConfig[] {
  const categoryKey = category.toLowerCase().replace(/\s+/g, '_');
  return Object.values(TEMPLATE_CONFIGS).filter(config => 
    config.templatePath.includes(categoryKey)
  );
}

// Fungsi untuk mendapatkan default positions
export function getDefaultPositions(templatePath: string) {
  const config = getTemplateConfig(templatePath);
  return config?.defaultPositions || null;
}
