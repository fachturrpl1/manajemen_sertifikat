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
  };
}

// Konfigurasi template dengan default positions
export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  "certificate/kunjungan_industri/industri1.png": {
    templatePath: "certificate/kunjungan_industri/industri1.png",
    name: "Industrial Visit Template 1",
    defaultPositions: {
      title: { 
        x: 260, 
        y: 190, 
        size: 32, 
        color: "#000000", 
        align: "center", 
        font: "Times New Roman, Times, serif" 
      },
      description: { 
        x: 260, 
        y: 240, 
        size: 12, 
        color: "#000000", 
        align: "center", 
        font: "Inter, ui-sans-serif, system-ui" 
      },
      date: { 
        x: 330, 
        y: 310, 
        size: 11, 
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
        x: 400,
        y: 200, 
        size: 28, 
        color: "#1a1a1a", 
        align: "center", 
        font: "Georgia, serif" 
      },
      description: { 
        x: 380, 
        y: 250, 
        size: 14, 
        color: "#333333", 
        align: "center", 
        font: "Inter, ui-sans-serif, system-ui" 
      },
      date: { 
        x: 325, 
        y: 359, 
        size: 12, 
        color: "#666666", 
        align: "right", 
        font: "Arial, Helvetica, sans-serif" 
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
      }
    }
  },
  "certificate/pelatihan/pelatihan1.png": {
    templatePath: "certificate/pelatihan/pelatihan1.png",
    name: "Training Template 1",
    defaultPositions: {
      title: { 
        x: 360, 
        y: 185, 
        size: 31, 
        color: "#000000", 
        align: "center", 
        font: "Inter, ui-sans-serif, system-ui" 
      },
      description: { 
        x: 350, 
        y: 230, 
        size: 15, 
        color: "#000000", 
        align: "center", 
        font: "Inter, ui-sans-serif, system-ui" 
      },
      date: { 
        x: 70, 
        y: 115, 
        size: 13, 
        color: "#000000", 
        align: "center", 
        font: "Inter, ui-sans-serif, system-ui" 
      }
    }
  }
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
