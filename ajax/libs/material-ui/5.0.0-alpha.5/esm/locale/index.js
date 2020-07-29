export var azAZ = {
  props: {
    MuiBreadcrumbs: {
      expandText: 'Yolu göstər'
    },
    MuiTablePagination: {
      getItemAriaLabel: function getItemAriaLabel(type) {
        if (type === 'first') {
          return 'Birinci səhifəyə keç';
        }

        if (type === 'last') {
          return 'Sonuncu səhifəyə keç';
        }

        if (type === 'next') {
          return 'Növbəti səhifəyə keç';
        } // if (type === 'previous') {


        return 'Əvvəlki səhifəyə keç';
      },
      labelRowsPerPage: 'Səhifəyə düşən sətrlər:',
      labelDisplayedRows: function labelDisplayedRows(_ref) {
        var from = _ref.from,
            to = _ref.to,
            count = _ref.count;
        return "".concat(from, "-").concat(to, " d\u0259n ").concat(count !== -1 ? count : "more than ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        var pluralForm = 'Ulduz';
        var lastDigit = value % 10;

        if (lastDigit > 1 && lastDigit < 5) {
          pluralForm = 'Ulduzlar';
        }

        return "".concat(value, " ").concat(pluralForm);
      },
      emptyLabelText: 'Boş'
    },
    MuiAutocomplete: {
      clearText: 'Silmək',
      closeText: 'Bağlamaq',
      loadingText: 'Yüklənir…',
      noOptionsText: 'Seçimlər mövcud deyil',
      openText: 'Открыть'
    },
    MuiAlert: {
      closeText: 'Bağlamaq'
    },
    MuiPagination: {
      'aria-label': 'Səhifənin naviqasiyası',
      getItemAriaLabel: function getItemAriaLabel(type, page, selected) {
        if (type === 'page') {
          return "".concat(page, " ").concat(selected ? 'səhifə' : 'səhifəyə keç');
        }

        if (type === 'first') {
          return 'Birinci səhifəyə keç';
        }

        if (type === 'last') {
          return 'Sonuncu səhifəyə keç';
        }

        if (type === 'next') {
          return 'Növbəti səhifəyə keç';
        } // if (type === 'previous') {


        return 'Əvvəlki səhifəyə keç';
      }
    }
  }
};
export var bgBG = {
  props: {
    MuiBreadcrumbs: {
      expandText: 'Показване на пътя'
    },
    MuiTablePagination: {
      getItemAriaLabel: function getItemAriaLabel(type) {
        if (type === 'first') {
          return 'Отиди на първата страница';
        }

        if (type === 'last') {
          return 'Отиди на последната страница';
        }

        if (type === 'next') {
          return 'Отиди на следващата страница';
        } // if (type === 'previous') {


        return 'Отиди на предишната страница';
      },
      labelRowsPerPage: 'Редове на страница:',
      labelDisplayedRows: function labelDisplayedRows(_ref2) {
        var from = _ref2.from,
            to = _ref2.to,
            count = _ref2.count;
        return "".concat(from, "-").concat(to, " \u043E\u0442 ").concat(count !== -1 ? count : "more than ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        return "".concat(value, " \u0417\u0432\u0435\u0437\u0434").concat(value !== 1 ? 'и' : 'а');
      },
      emptyLabelText: 'Изчисти'
    },
    MuiAutocomplete: {
      clearText: 'Изчисти',
      closeText: 'Затвори',
      loadingText: 'Зареждане…',
      noOptionsText: 'Няма налични опции',
      openText: 'Отвори'
    },
    MuiAlert: {
      closeText: 'Затвори'
    },
    MuiPagination: {
      'aria-label': 'Пагинация',
      getItemAriaLabel: function getItemAriaLabel(type, page, selected) {
        if (type === 'page') {
          return "".concat(selected ? '' : 'Към ', "\u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0430 ").concat(page);
        }

        if (type === 'first') {
          return 'Отиди на първата страница';
        }

        if (type === 'last') {
          return 'Отиди на последната страница';
        }

        if (type === 'next') {
          return 'Отиди на следващата страница';
        } // if (type === 'previous') {


        return 'Отиди на предишната страница';
      }
    }
  }
};
export var caES = {
  props: {
    // MuiBreadcrumbs: {
    //   expandText: 'Show path',
    // },
    MuiTablePagination: {
      // getItemAriaLabel: (type) => {
      //   if (type === 'first') {
      //     return 'Go to first page';
      //   }
      //   if (type === 'last') {
      //     return 'Go to last page';
      //   }
      //   if (type === 'next') {
      //     return 'Go to next page';
      //   }
      //   // if (type === 'previous') {
      //   return 'Go to previous page';
      // },
      labelRowsPerPage: 'Files per pàgina:',
      labelDisplayedRows: function labelDisplayedRows(_ref3) {
        var from = _ref3.from,
            to = _ref3.to,
            count = _ref3.count;
        return "".concat(from, "-").concat(to, " de ").concat(count !== -1 ? count : "more than ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        return "".concat(value, " ").concat(value !== 1 ? 'Estrelles' : 'Estrella');
      },
      emptyLabelText: 'Buit'
    },
    MuiAutocomplete: {
      clearText: 'Netejar',
      closeText: 'Tancar',
      loadingText: 'Carregant…',
      noOptionsText: 'Sense opcions',
      openText: 'Obert'
    },
    MuiAlert: {
      closeText: 'Tancat'
    } // MuiPagination: {
    //   'aria-label': 'Pagination navigation',
    //   getItemAriaLabel: (type, page, selected) => {
    //     if (type === 'page') {
    //       return `${selected ? '' : 'Go to '}page ${page}`;
    //     }
    //     if (type === 'first') {
    //       return 'Go to first page';
    //     }
    //     if (type === 'last') {
    //       return 'Go to last page';
    //     }
    //     if (type === 'next') {
    //       return 'Go to next page';
    //     }
    //     // if (type === 'previous') {
    //     return 'Go to previous page';
    //   },
    // },

  }
};
export var csCZ = {
  props: {
    MuiBreadcrumbs: {
      expandText: 'Ukázat cestu'
    },
    MuiTablePagination: {
      getItemAriaLabel: function getItemAriaLabel(type) {
        if (type === 'first') {
          return 'Jít na první stránku';
        }

        if (type === 'last') {
          return 'Jít na poslední stránku';
        }

        if (type === 'next') {
          return 'Jít na další stránku';
        } // if (type === 'previous') {


        return 'Jít na předchozí stránku';
      },
      labelRowsPerPage: 'Řádků na stránce:',
      labelDisplayedRows: function labelDisplayedRows(_ref4) {
        var from = _ref4.from,
            to = _ref4.to,
            count = _ref4.count;
        return "".concat(from, "-").concat(to, " z ").concat(count !== -1 ? count : "v\xEDce ne\u017E ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        if (value === 1) {
          return "".concat(value, " hv\u011Bzdi\u010Dka");
        }

        if (value >= 2 && value <= 4) {
          return "".concat(value, " hv\u011Bzdi\u010Dky");
        }

        return "".concat(value, " hv\u011Bzdi\u010Dek");
      },
      emptyLabelText: 'Prázdné'
    },
    MuiAutocomplete: {
      clearText: 'Vymazat',
      closeText: 'Zavřít',
      loadingText: 'Načítání…',
      noOptionsText: 'Žádné možnosti',
      openText: 'Otevřít'
    },
    MuiAlert: {
      closeText: 'Zavřít'
    },
    MuiPagination: {
      'aria-label': 'Navigace stránkováním',
      getItemAriaLabel: function getItemAriaLabel(type, page, selected) {
        if (type === 'page') {
          return "".concat(selected ? '' : 'Jít na ').concat(page, " str\xE1nku");
        }

        if (type === 'first') {
          return 'Jít na první stránku';
        }

        if (type === 'last') {
          return 'Jít na poslední stránku';
        }

        if (type === 'next') {
          return 'Jít na další stránku';
        } // if (type === 'previous') {


        return 'Jít na předchozí stránku';
      }
    }
  }
};
export var deDE = {
  props: {
    MuiBreadcrumbs: {
      expandText: 'Pfad anzeigen'
    },
    MuiTablePagination: {
      getItemAriaLabel: function getItemAriaLabel(type) {
        if (type === 'first') {
          return 'Zur ersten Seite';
        }

        if (type === 'last') {
          return 'Zur letzten Seite';
        }

        if (type === 'next') {
          return 'Zur nächsten Seite';
        } // if (type === 'previous') {


        return 'Zur vorherigen Seite';
      },
      labelRowsPerPage: 'Zeilen pro Seite:',
      labelDisplayedRows: function labelDisplayedRows(_ref5) {
        var from = _ref5.from,
            to = _ref5.to,
            count = _ref5.count;
        return "".concat(from, "-").concat(to, " von ").concat(count !== -1 ? count : "more than ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        return "".concat(value, " ").concat(value !== 1 ? 'Sterne' : 'Stern');
      },
      emptyLabelText: 'Keine Wertung'
    },
    MuiAutocomplete: {
      clearText: 'Leeren',
      closeText: 'Schließen',
      loadingText: 'Wird geladen…',
      noOptionsText: 'Keine Optionen',
      openText: 'Öffnen'
    },
    MuiAlert: {
      closeText: 'Schließen'
    },
    MuiPagination: {
      'aria-label': 'Navigation via Seitennummerierung',
      getItemAriaLabel: function getItemAriaLabel(type, page, selected) {
        if (type === 'page') {
          return "".concat(selected ? '' : 'Gehe zu ', "Seite ").concat(page);
        }

        if (type === 'first') {
          return 'Zur ersten Seite';
        }

        if (type === 'last') {
          return 'Zur letzten Seite';
        }

        if (type === 'next') {
          return 'Zur nächsten Seite';
        } // if (type === 'previous') {


        return 'Zur vorherigen Seite';
      }
    }
  }
}; // default

export var enUS = {
  /*
  props: {
    MuiBreadcrumbs: {
      expandText: 'Show path',
    },
    MuiTablePagination: {
      getItemAriaLabel: (type) => {
        if (type === 'first') {
          return 'Go to first page';
        }
        if (type === 'last') {
          return 'Go to last page';
        }
        if (type === 'next') {
          return 'Go to next page';
        }
        // if (type === 'previous') {
        return 'Go to previous page';
      },
      labelRowsPerPage: 'Rows per page:',
      labelDisplayedRows: ({ from, to, count }) =>
  `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`,
    },
    MuiRating: {
      getLabelText: value => `${value} Star${value !== 1 ? 's' : ''}`,
      emptyLabelText: 'Empty',
    },
    MuiAutocomplete: {
      clearText: 'Clear',
      closeText: 'Close',
      loadingText: 'Loading…',
      noOptionsText: 'No options',
      openText: 'Open',
    },
    MuiAlert: {
      closeText: 'Close',
    },
    MuiPagination: {
      'aria-label': 'Pagination navigation',
      getItemAriaLabel: (type, page, selected) => {
        if (type === 'page') {
          return `${selected ? '' : 'Go to '}page ${page}`;
        }
        if (type === 'first') {
          return 'Go to first page';
        }
        if (type === 'last') {
          return 'Go to last page';
        }
        if (type === 'next') {
          return 'Go to next page';
        }
        // if (type === 'previous') {
        return 'Go to previous page';
      },
    },
  },
  */
};
export var esES = {
  props: {
    MuiBreadcrumbs: {
      expandText: 'Mostrar ruta'
    },
    MuiTablePagination: {
      getItemAriaLabel: function getItemAriaLabel(type) {
        if (type === 'first') {
          return 'Ir a la primera página';
        }

        if (type === 'last') {
          return 'Ir a la última página';
        }

        if (type === 'next') {
          return 'Ir a la página siguiente';
        } // if (type === 'previous') {


        return 'Ir a la página anterior';
      },
      labelRowsPerPage: 'Filas por página:',
      labelDisplayedRows: function labelDisplayedRows(_ref6) {
        var from = _ref6.from,
            to = _ref6.to,
            count = _ref6.count;
        return "".concat(from, "-").concat(to, " de ").concat(count !== -1 ? count : "more than ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        return "".concat(value, " Estrella").concat(value !== 1 ? 's' : '');
      },
      emptyLabelText: 'Vacío'
    },
    MuiAutocomplete: {
      clearText: 'Limpiar',
      closeText: 'Cerrar',
      loadingText: 'Cargando…',
      noOptionsText: 'Sin opciones',
      openText: 'Abierto'
    },
    MuiAlert: {
      closeText: 'Cerrar'
    },
    MuiPagination: {
      'aria-label': 'Paginador',
      getItemAriaLabel: function getItemAriaLabel(type, page, selected) {
        if (type === 'page') {
          return "".concat(selected ? '' : 'Ir a la ', "p\xE1gina ").concat(page);
        }

        if (type === 'first') {
          return 'Ir a la primera página';
        }

        if (type === 'last') {
          return 'Ir a la última página';
        }

        if (type === 'next') {
          return 'Ir a la página siguiente';
        } // if (type === 'previous') {


        return 'Ir a la página anterior';
      }
    }
  }
};
export var etEE = {
  props: {
    MuiBreadcrumbs: {
      expandText: 'Näita teed'
    },
    MuiTablePagination: {
      getItemAriaLabel: function getItemAriaLabel(type) {
        if (type === 'first') {
          return 'Vali esimene lehekülg';
        }

        if (type === 'last') {
          return 'Vali viimane lehekülg';
        }

        if (type === 'next') {
          return 'Vali järgmine lehekülg';
        } // if (type === 'previous') {


        return 'Vali eelmine lehekülg';
      },
      labelRowsPerPage: 'Ridu leheküljel:',
      labelDisplayedRows: function labelDisplayedRows(_ref7) {
        var from = _ref7.from,
            to = _ref7.to,
            count = _ref7.count;
        return "".concat(from, "-").concat(to, " / ").concat(count !== -1 ? count : "more than ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        return "".concat(value, " T\xE4rn").concat(value !== 1 ? 'i' : '');
      },
      emptyLabelText: 'Tühi'
    },
    MuiAutocomplete: {
      clearText: 'Tühjenda',
      closeText: 'Sulge',
      loadingText: 'Laen…',
      noOptionsText: 'Valikuid ei ole',
      openText: 'Ava'
    },
    MuiAlert: {
      closeText: 'Sulge'
    },
    MuiPagination: {
      'aria-label': 'Lehekülgede valik',
      getItemAriaLabel: function getItemAriaLabel(type, page, selected) {
        if (type === 'page') {
          return "".concat(selected ? '' : 'Vali ', "lehek\xFClg ").concat(page);
        }

        if (type === 'first') {
          return 'Vali esimene lehekülg';
        }

        if (type === 'last') {
          return 'Vali viimane lehekülg';
        }

        if (type === 'next') {
          return 'Vali järgmine lehekülg';
        } // if (type === 'previous') {


        return 'Vali eelmine lehekülg';
      }
    }
  }
};
export var faIR = {
  props: {
    // MuiBreadcrumbs: {
    //   expandText: 'Show path',
    // },
    MuiBreadcrumbs: {
      expandText: 'نمایش مسیر'
    },
    MuiTablePagination: {
      getItemAriaLabel: function getItemAriaLabel(type) {
        if (type === 'first') {
          return 'رفتن به اولین صفحه';
        }

        if (type === 'last') {
          return 'رفتن به آخرین صفحه';
        }

        if (type === 'next') {
          return 'رفتن به صفحه‌ی بعدی';
        } // if (type === 'previous') {


        return 'رفتن به صفحه‌ی قبلی';
      },
      labelRowsPerPage: 'تعداد سطرهای هر صفحه:',
      labelDisplayedRows: function labelDisplayedRows(_ref8) {
        var from = _ref8.from,
            to = _ref8.to,
            count = _ref8.count;
        return "".concat(from, "-").concat(to, " \u0627\u0632 ").concat(count !== -1 ? count : "more than ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        return "".concat(value, " \u0633\u062A\u0627\u0631\u0647");
      },
      emptyLabelText: 'خالی'
    },
    MuiAutocomplete: {
      clearText: 'پاک‌کردن',
      closeText: 'بستن',
      loadingText: 'در حال بارگذاری…',
      noOptionsText: 'بی‌نتیجه',
      openText: 'بازکردن'
    },
    MuiAlert: {
      closeText: 'بستن'
    },
    MuiPagination: {
      'aria-label': 'ناوبری صفحه',
      getItemAriaLabel: function getItemAriaLabel(type, page, selected) {
        if (type === 'page') {
          return "".concat(selected ? '' : 'رفتن به ', "\u0635\u0641\u062D\u0647\u0654 ").concat(page);
        }

        if (type === 'first') {
          return 'رفتن به اولین صفحه';
        }

        if (type === 'last') {
          return 'رفتن به آخرین صفحه';
        }

        if (type === 'next') {
          return 'رفتن به صفحه‌ی بعدی';
        } // if (type === 'previous') {


        return 'رفتن به صفحه‌ی قبلی';
      }
    }
  }
};
export var fiFI = {
  props: {
    MuiBreadcrumbs: {
      expandText: 'Näytä reitti'
    },
    MuiTablePagination: {
      getItemAriaLabel: function getItemAriaLabel(type) {
        if (type === 'first') {
          return 'Mene ensimmäiselle sivulle';
        }

        if (type === 'last') {
          return 'Mene viimeiselle sivulle';
        }

        if (type === 'next') {
          return 'Mene seuraavalle sivulle';
        } // if (type === 'previous') {


        return 'Mene edelliselle sivulle';
      },
      labelRowsPerPage: 'Rivejä per sivu:',
      labelDisplayedRows: function labelDisplayedRows(_ref9) {
        var from = _ref9.from,
            to = _ref9.to,
            count = _ref9.count;
        return "".concat(from, "-").concat(to, " / ").concat(count !== -1 ? count : "more than ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        return "".concat(value, " T\xE4ht").concat(value !== 1 ? 'eä' : 'i');
      },
      emptyLabelText: 'Tyhjä'
    },
    MuiAutocomplete: {
      clearText: 'Tyhjennä',
      closeText: 'Sulje',
      loadingText: 'Ladataan…',
      noOptionsText: 'Ei valintoja',
      openText: 'Avaa'
    },
    MuiAlert: {
      closeText: 'Sulje'
    },
    MuiPagination: {
      'aria-label': 'Sivutus navigaatio',
      getItemAriaLabel: function getItemAriaLabel(type, page, selected) {
        if (type === 'page') {
          return "".concat(selected ? 'sivu' : 'Mene sivulle', " ").concat(page);
        }

        if (type === 'first') {
          return 'Mene ensimmäiselle sivulle';
        }

        if (type === 'last') {
          return 'Mene viimeiselle sivulle';
        }

        if (type === 'next') {
          return 'Mene seuraavalle sivulle';
        } // if (type === 'previous') {


        return 'Mene edelliselle sivulle';
      }
    }
  }
};
export var frFR = {
  props: {
    MuiBreadcrumbs: {
      expandText: 'Montrer le chemin'
    },
    MuiTablePagination: {
      getItemAriaLabel: function getItemAriaLabel(type) {
        if (type === 'first') {
          return 'Aller à la première page';
        }

        if (type === 'last') {
          return 'Aller à la dernière page';
        }

        if (type === 'next') {
          return 'Aller à la page suivante';
        } // if (type === 'previous') {


        return 'Aller à la page précédente';
      },
      labelRowsPerPage: 'Lignes par page :',
      labelDisplayedRows: function labelDisplayedRows(_ref10) {
        var from = _ref10.from,
            to = _ref10.to,
            count = _ref10.count;
        return "".concat(from, "-").concat(to, " sur ").concat(count !== -1 ? count : "plus que ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        return "".concat(value, " Etoile").concat(value !== 1 ? 's' : '');
      },
      emptyLabelText: 'Vide'
    },
    MuiAutocomplete: {
      clearText: 'Vider',
      closeText: 'Fermer',
      loadingText: 'Chargement…',
      noOptionsText: 'Pas de résultats',
      openText: 'Ouvrir'
    },
    MuiAlert: {
      closeText: 'Fermer'
    },
    MuiPagination: {
      'aria-label': 'navigation de pagination',
      getItemAriaLabel: function getItemAriaLabel(type, page, selected) {
        if (type === 'page') {
          return "".concat(selected ? '' : 'Aller à la ', "page ").concat(page);
        }

        if (type === 'first') {
          return 'Aller à la première page';
        }

        if (type === 'last') {
          return 'Aller à la dernière page';
        }

        if (type === 'next') {
          return 'Aller à la page suivante';
        } // if (type === 'previous') {


        return 'Aller à la page précédente';
      }
    }
  }
};
export var heIL = {
  props: {
    // MuiBreadcrumbs: {
    //   expandText: 'Show path',
    // },
    MuiTablePagination: {
      // getItemAriaLabel: (type) => {
      //   if (type === 'first') {
      //     return 'Go to first page';
      //   }
      //   if (type === 'last') {
      //     return 'Go to last page';
      //   }
      //   if (type === 'next') {
      //     return 'Go to next page';
      //   }
      //   // if (type === 'previous') {
      //   return 'Go to previous page';
      // },
      labelRowsPerPage: 'שורות בעמוד:',
      labelDisplayedRows: function labelDisplayedRows(_ref11) {
        var from = _ref11.from,
            to = _ref11.to,
            count = _ref11.count;
        return "".concat(from, "-").concat(to, " \u05DE\u05EA\u05D5\u05DA ").concat(count !== -1 ? count : "more than ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        return "".concat(value, " \u05DB\u05D5\u05DB\u05D1").concat(value !== 1 ? 'ים' : '');
      },
      emptyLabelText: 'ריק'
    },
    MuiAutocomplete: {
      clearText: 'נקה',
      closeText: 'סגור',
      loadingText: 'טוען…',
      noOptionsText: 'אין אופציות',
      openText: 'פתח'
    },
    MuiAlert: {
      closeText: 'סגור'
    } // MuiPagination: {
    //   'aria-label': 'Pagination navigation',
    //   getItemAriaLabel: (type, page, selected) => {
    //     if (type === 'page') {
    //       return `${selected ? '' : 'Go to '}page ${page}`;
    //     }
    //     if (type === 'first') {
    //       return 'Go to first page';
    //     }
    //     if (type === 'last') {
    //       return 'Go to last page';
    //     }
    //     if (type === 'next') {
    //       return 'Go to next page';
    //     }
    //     // if (type === 'previous') {
    //     return 'Go to previous page';
    //   },
    // },

  }
};
export var hiIN = {
  props: {
    MuiBreadcrumbs: {
      expandText: 'रास्ता दिखायें'
    },
    MuiTablePagination: {
      getItemAriaLabel: function getItemAriaLabel(type) {
        if (type === 'first') {
          return 'पहले पृष्ठ पर जाएँ';
        }

        if (type === 'last') {
          return 'अंतिम पृष्ठ पर जाएँ';
        }

        if (type === 'next') {
          return 'अगले पृष्ठ पर जाएँ';
        } // if (type === 'previous') {


        return 'पिछले पृष्ठ पर जाएँ';
      },
      labelRowsPerPage: 'पंक्तियाँ प्रति पृष्ठ:',
      labelDisplayedRows: function labelDisplayedRows(_ref12) {
        var from = _ref12.from,
            to = _ref12.to,
            count = _ref12.count;
        return "".concat(from, "-").concat(to === -1 ? count : to, " \u0915\u0941\u0932 ").concat(count, " \u092E\u0947\u0902");
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        return "".concat(value, " \u0924\u093E\u0930").concat(value !== 1 ? 'े' : 'ा');
      },
      emptyLabelText: 'रिक्त'
    },
    MuiAutocomplete: {
      clearText: 'हटायें',
      closeText: 'बंद करें',
      loadingText: 'लोड हो रहा है…',
      noOptionsText: 'कोई विकल्प नहीं',
      openText: 'खोलें'
    },
    MuiAlert: {
      closeText: 'बंद करें'
    },
    MuiPagination: {
      'aria-label': 'पृस्ठानुसार संचालन',
      getItemAriaLabel: function getItemAriaLabel(type, page, selected) {
        if (type === 'page') {
          return "\u092A\u0943\u0937\u094D\u0920 ".concat(page, " ").concat(selected ? '' : ' पर जाएँ');
        }

        if (type === 'first') {
          return 'पहले पृष्ठ पर जाएँ';
        }

        if (type === 'last') {
          return 'अंतिम पृष्ठ पर जाएँ';
        }

        if (type === 'next') {
          return 'अगले पृष्ठ पर जाएँ';
        } // if (type === 'previous') {


        return 'पिछले पृष्ठ पर जाएँ';
      }
    }
  }
};
export var huHU = {
  props: {
    MuiBreadcrumbs: {
      expandText: 'Útvonal'
    },
    MuiTablePagination: {
      getItemAriaLabel: function getItemAriaLabel(type) {
        if (type === 'first') {
          return 'Első oldalra';
        }

        if (type === 'last') {
          return 'Utolsó oldalra';
        }

        if (type === 'next') {
          return 'Következő oldalra';
        } // if (type === 'previous') {


        return 'Előző oldalra';
      },
      labelRowsPerPage: 'Sorok száma:',
      labelDisplayedRows: function labelDisplayedRows(_ref13) {
        var from = _ref13.from,
            to = _ref13.to,
            count = _ref13.count;
        return "".concat(from, "-").concat(to, " / ").concat(count !== -1 ? count : "more than ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        return "".concat(value, " Csillag");
      },
      emptyLabelText: 'Üres'
    },
    MuiAutocomplete: {
      clearText: 'Törlés',
      closeText: 'Bezárás',
      loadingText: 'Töltés…',
      noOptionsText: 'Nincs találat',
      openText: 'Megnyitás'
    },
    MuiAlert: {
      closeText: 'Bezárás'
    },
    MuiPagination: {
      'aria-label': 'Lapozás',
      getItemAriaLabel: function getItemAriaLabel(type, page, selected) {
        if (type === 'page') {
          return "".concat(page, ". oldal").concat(selected ? '' : 'ra');
        }

        if (type === 'first') {
          return 'Első oldalra';
        }

        if (type === 'last') {
          return 'Utolsó oldalra';
        }

        if (type === 'next') {
          return 'Következő oldalra';
        } // if (type === 'previous') {


        return 'Előző oldalra';
      }
    }
  }
};
export var hyAM = {
  props: {
    // MuiBreadcrumbs: {
    //   expandText: 'Show path',
    // },
    MuiTablePagination: {
      // getItemAriaLabel: (type) => {
      //   if (type === 'first') {
      //     return 'Go to first page';
      //   }
      //   if (type === 'last') {
      //     return 'Go to last page';
      //   }
      //   if (type === 'next') {
      //     return 'Go to next page';
      //   }
      //   // if (type === 'previous') {
      //   return 'Go to previous page';
      // },
      labelRowsPerPage: 'Տողեր մեկ էջում`',
      labelDisplayedRows: function labelDisplayedRows(_ref14) {
        var from = _ref14.from,
            to = _ref14.to,
            count = _ref14.count;
        return "".concat(from, "-").concat(to, " / ").concat(count !== -1 ? count : "more than ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        return "".concat(value, " \u0531\u057D\u057F\u0572");
      },
      emptyLabelText: 'Դատարկ'
    },
    MuiAutocomplete: {
      clearText: 'Մաքրել',
      closeText: 'Փակել',
      loadingText: 'Բեռնում…',
      noOptionsText: 'Տարբերակներ չկան',
      openText: 'Բացել'
    },
    MuiAlert: {
      closeText: 'Փակել'
    } // MuiPagination: {
    //   'aria-label': 'Pagination navigation',
    //   getItemAriaLabel: (type, page, selected) => {
    //     if (type === 'page') {
    //       return `${selected ? '' : 'Go to '}page ${page}`;
    //     }
    //     if (type === 'first') {
    //       return 'Go to first page';
    //     }
    //     if (type === 'last') {
    //       return 'Go to last page';
    //     }
    //     if (type === 'next') {
    //       return 'Go to next page';
    //     }
    //     // if (type === 'previous') {
    //     return 'Go to previous page';
    //   },
    // },

  }
};
export var idID = {
  props: {
    // MuiBreadcrumbs: {
    //   expandText: 'Show path',
    // },
    MuiTablePagination: {
      // getItemAriaLabel: (type) => {
      //   if (type === 'first') {
      //     return 'Go to first page';
      //   }
      //   if (type === 'last') {
      //     return 'Go to last page';
      //   }
      //   if (type === 'next') {
      //     return 'Go to next page';
      //   }
      //   // if (type === 'previous') {
      //   return 'Go to previous page';
      // },
      labelRowsPerPage: 'Baris per halaman:',
      labelDisplayedRows: function labelDisplayedRows(_ref15) {
        var from = _ref15.from,
            to = _ref15.to,
            count = _ref15.count;
        return "".concat(from, "-").concat(to, " dari ").concat(count !== -1 ? count : "more than ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        return "".concat(value, " Bintang");
      } // emptyLabelText: 'Empty',

    },
    MuiAutocomplete: {
      clearText: 'Hapus',
      closeText: 'Tutup',
      loadingText: 'Memuat…',
      noOptionsText: 'Tidak ada opsi',
      openText: 'Buka'
    },
    MuiAlert: {
      closeText: 'Tutup'
    } // MuiPagination: {
    //   'aria-label': 'Pagination navigation',
    //   getItemAriaLabel: (type, page, selected) => {
    //     if (type === 'page') {
    //       return `${selected ? '' : 'Go to '}page ${page}`;
    //     }
    //     if (type === 'first') {
    //       return 'Go to first page';
    //     }
    //     if (type === 'last') {
    //       return 'Go to last page';
    //     }
    //     if (type === 'next') {
    //       return 'Go to next page';
    //     }
    //     // if (type === 'previous') {
    //     return 'Go to previous page';
    //   },
    // },

  }
};
export var isIS = {
  props: {
    // MuiBreadcrumbs: {
    //   expandText: 'Show path',
    // },
    MuiTablePagination: {
      // getItemAriaLabel: (type) => {
      //   if (type === 'first') {
      //     return 'Go to first page';
      //   }
      //   if (type === 'last') {
      //     return 'Go to last page';
      //   }
      //   if (type === 'next') {
      //     return 'Go to next page';
      //   }
      //   // if (type === 'previous') {
      //   return 'Go to previous page';
      // },
      labelRowsPerPage: 'Raðir á síðu:',
      labelDisplayedRows: function labelDisplayedRows(_ref16) {
        var from = _ref16.from,
            to = _ref16.to,
            count = _ref16.count;
        return "".concat(from, "-").concat(to, " af ").concat(count !== -1 ? count : "more than ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        return "".concat(value, " ").concat(value === 1 ? 'Stjarna' : 'Stjörnur');
      },
      emptyLabelText: 'Tómt'
    },
    MuiAutocomplete: {
      clearText: 'Hreinsa',
      closeText: 'Loka',
      loadingText: 'Hlaða…',
      noOptionsText: 'Engar niðurstöður',
      openText: 'Opna'
    },
    MuiAlert: {
      closeText: 'Loka'
    } // MuiPagination: {
    //   'aria-label': 'Pagination navigation',
    //   getItemAriaLabel: (type, page, selected) => {
    //     if (type === 'page') {
    //       return `${selected ? '' : 'Go to '}page ${page}`;
    //     }
    //     if (type === 'first') {
    //       return 'Go to first page';
    //     }
    //     if (type === 'last') {
    //       return 'Go to last page';
    //     }
    //     if (type === 'next') {
    //       return 'Go to next page';
    //     }
    //     // if (type === 'previous') {
    //     return 'Go to previous page';
    //   },
    // },

  }
};
export var itIT = {
  props: {
    MuiBreadcrumbs: {
      expandText: 'Visualizza percorso'
    },
    MuiTablePagination: {
      getItemAriaLabel: function getItemAriaLabel(type) {
        if (type === 'first') {
          return 'Vai alla prima pagina';
        }

        if (type === 'last') {
          return "Vai all'ultima pagina";
        }

        if (type === 'next') {
          return 'Vai alla pagina successiva';
        } // if (type === 'previous') {


        return 'Vai alla pagina precedente';
      },
      labelRowsPerPage: 'Righe per pagina:',
      labelDisplayedRows: function labelDisplayedRows(_ref17) {
        var from = _ref17.from,
            to = _ref17.to,
            count = _ref17.count;
        return "".concat(from, "-").concat(to, " di ").concat(count !== -1 ? count : "more than ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        return "".concat(value, " Stell").concat(value !== 1 ? 'e' : 'a');
      },
      emptyLabelText: 'Vuoto'
    },
    MuiAutocomplete: {
      clearText: 'Svuota',
      closeText: 'Chiudi',
      loadingText: 'Caricamento in corso…',
      noOptionsText: 'Nessuna opzione',
      openText: 'Apri'
    },
    MuiAlert: {
      closeText: 'Chiudi'
    },
    MuiPagination: {
      'aria-label': 'Navigazione impaginata',
      getItemAriaLabel: function getItemAriaLabel(type, page, selected) {
        if (type === 'page') {
          return "".concat(selected ? '' : 'Vai alla ', "pagina ").concat(page);
        }

        if (type === 'first') {
          return 'Vai alla prima pagina';
        }

        if (type === 'last') {
          return "Vai all'ultima pagina";
        }

        if (type === 'next') {
          return 'Vai alla pagina successiva';
        } // if (type === 'previous') {


        return 'Vai alla pagina precedente';
      }
    }
  }
};
export var jaJP = {
  props: {
    // MuiBreadcrumbs: {
    //   expandText: 'Show path',
    // },
    MuiTablePagination: {
      // getItemAriaLabel: (type) => {
      //   if (type === 'first') {
      //     return 'Go to first page';
      //   }
      //   if (type === 'last') {
      //     return 'Go to last page';
      //   }
      //   if (type === 'next') {
      //     return 'Go to next page';
      //   }
      //   // if (type === 'previous') {
      //   return 'Go to previous page';
      // },
      labelRowsPerPage: 'ページごとの行:',
      labelDisplayedRows: function labelDisplayedRows(_ref18) {
        var from = _ref18.from,
            to = _ref18.to,
            count = _ref18.count;
        return "".concat(from, "-").concat(to, " of ").concat(count !== -1 ? count : "more than ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        return "".concat(value, " ").concat(value !== 1 ? '出演者' : '星');
      } // emptyLabelText: 'Empty',

    },
    MuiAutocomplete: {
      clearText: 'クリア',
      closeText: '閉じる',
      loadingText: '積み込み…',
      noOptionsText: '結果がありません',
      openText: '開いた'
    },
    MuiAlert: {
      closeText: '閉じる'
    } // MuiPagination: {
    //   'aria-label': 'Pagination navigation',
    //   getItemAriaLabel: (type, page, selected) => {
    //     if (type === 'page') {
    //       return `${selected ? '' : 'Go to '}page ${page}`;
    //     }
    //     if (type === 'first') {
    //       return 'Go to first page';
    //     }
    //     if (type === 'last') {
    //       return 'Go to last page';
    //     }
    //     if (type === 'next') {
    //       return 'Go to next page';
    //     }
    //     // if (type === 'previous') {
    //     return 'Go to previous page';
    //   },
    // },

  }
};
export var koKR = {
  props: {
    // MuiBreadcrumbs: {
    //   expandText: 'Show path',
    // },
    MuiTablePagination: {
      // getItemAriaLabel: (type) => {
      //   if (type === 'first') {
      //     return 'Go to first page';
      //   }
      //   if (type === 'last') {
      //     return 'Go to last page';
      //   }
      //   if (type === 'next') {
      //     return 'Go to next page';
      //   }
      //   // if (type === 'previous') {
      //   return 'Go to previous page';
      // },
      labelRowsPerPage: '페이지 당 행:',
      labelDisplayedRows: function labelDisplayedRows(_ref19) {
        var from = _ref19.from,
            to = _ref19.to,
            count = _ref19.count;
        return "".concat(from, "-").concat(to, " / ").concat(count !== -1 ? count : "more than ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        return "".concat(value, " \uC810");
      } // emptyLabelText: 'Empty',

    },
    MuiAutocomplete: {
      clearText: '지우기',
      closeText: '닫기',
      loadingText: '불러오는 중…',
      noOptionsText: '옵션 없음',
      openText: '열기'
    } // MuiAlert: {
    //   closeText: 'Close',
    // },
    // MuiPagination: {
    //   'aria-label': 'Pagination navigation',
    //   getItemAriaLabel: (type, page, selected) => {
    //     if (type === 'page') {
    //       return `${selected ? '' : 'Go to '}page ${page}`;
    //     }
    //     if (type === 'first') {
    //       return 'Go to first page';
    //     }
    //     if (type === 'last') {
    //       return 'Go to last page';
    //     }
    //     if (type === 'next') {
    //       return 'Go to next page';
    //     }
    //     // if (type === 'previous') {
    //     return 'Go to previous page';
    //   },
    // },

  }
};
export var nlNL = {
  props: {
    // MuiBreadcrumbs: {
    //   expandText: 'Show path',
    // },
    MuiTablePagination: {
      // getItemAriaLabel: (type) => {
      //   if (type === 'first') {
      //     return 'Go to first page';
      //   }
      //   if (type === 'last') {
      //     return 'Go to last page';
      //   }
      //   if (type === 'next') {
      //     return 'Go to next page';
      //   }
      //   // if (type === 'previous') {
      //   return 'Go to previous page';
      // },
      labelRowsPerPage: 'Regels per pagina :',
      labelDisplayedRows: function labelDisplayedRows(_ref20) {
        var from = _ref20.from,
            to = _ref20.to,
            count = _ref20.count;
        return "".concat(from, "-").concat(to, " van ").concat(count !== -1 ? count : "more than ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        return "".concat(value, " Ster").concat(value !== 1 ? 'ren' : '');
      } // emptyLabelText: 'Empty',

    },
    MuiAutocomplete: {
      clearText: 'Wissen',
      closeText: 'Sluiten',
      loadingText: 'Laden…',
      noOptionsText: 'Geen opties',
      openText: 'Openen'
    },
    MuiAlert: {
      closeText: 'Sluiten'
    } // MuiPagination: {
    //   'aria-label': 'Pagination navigation',
    //   getItemAriaLabel: (type, page, selected) => {
    //     if (type === 'page') {
    //       return `${selected ? '' : 'Go to '}page ${page}`;
    //     }
    //     if (type === 'first') {
    //       return 'Go to first page';
    //     }
    //     if (type === 'last') {
    //       return 'Go to last page';
    //     }
    //     if (type === 'next') {
    //       return 'Go to next page';
    //     }
    //     // if (type === 'previous') {
    //     return 'Go to previous page';
    //   },
    // },

  }
};
export var plPL = {
  props: {
    MuiBreadcrumbs: {
      expandText: 'Pokaż ścieżkę'
    },
    MuiTablePagination: {
      getItemAriaLabel: function getItemAriaLabel(type) {
        if (type === 'first') {
          return 'Przejdź do pierwszej strony';
        }

        if (type === 'last') {
          return 'Przejdź do ostatniej strony';
        }

        if (type === 'next') {
          return 'Przejdź do następnej strony';
        } // if (type === 'previous') {


        return 'Przejdź do poprzedniej strony';
      },
      labelRowsPerPage: 'Wierszy na stronę:',
      labelDisplayedRows: function labelDisplayedRows(_ref21) {
        var from = _ref21.from,
            to = _ref21.to,
            count = _ref21.count;
        return "".concat(from, "-").concat(to, " z ").concat(count !== -1 ? count : "more than ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        var pluralForm = 'gwiazdek';
        var lastDigit = value % 10;

        if ((value < 10 || value > 20) && lastDigit > 1 && lastDigit < 5) {
          pluralForm = 'gwiazdki';
        } else if (value === 1) {
          pluralForm = 'gwiazdka';
        }

        return "".concat(value, " ").concat(pluralForm);
      },
      emptyLabelText: 'Brak gwiazdek'
    },
    MuiAutocomplete: {
      clearText: 'Wyczyść',
      closeText: 'Zamknij',
      loadingText: 'Ładowanie…',
      noOptionsText: 'Brak opcji',
      openText: 'Otwórz'
    },
    MuiAlert: {
      closeText: 'Zamknij'
    },
    MuiPagination: {
      'aria-label': 'Nawigacja podziału na strony',
      getItemAriaLabel: function getItemAriaLabel(type, page, selected) {
        if (type === 'page') {
          return selected ? "".concat(page, ". strona") : "Przejd\u017A do ".concat(page, ". strony");
        }

        if (type === 'first') {
          return 'Przejdź do pierwszej strony';
        }

        if (type === 'last') {
          return 'Przejdź do ostatniej strony';
        }

        if (type === 'next') {
          return 'Przejdź do następnej strony';
        } // if (type === 'previous') {


        return 'Przejdź do poprzedniej strony';
      }
    }
  }
};
export var ptBR = {
  props: {
    MuiBreadcrumbs: {
      expandText: 'Mostrar caminho'
    },
    MuiTablePagination: {
      getItemAriaLabel: function getItemAriaLabel(type) {
        if (type === 'first') {
          return 'Ir para a primeira página';
        }

        if (type === 'last') {
          return 'Ir para a última página';
        }

        if (type === 'next') {
          return 'Ir para a próxima página';
        } // if (type === 'previous') {


        return 'Ir para a página anterior';
      },
      labelRowsPerPage: 'Linhas por página:',
      labelDisplayedRows: function labelDisplayedRows(_ref22) {
        var from = _ref22.from,
            to = _ref22.to,
            count = _ref22.count;
        return "".concat(from, "-").concat(to, " de ").concat(count !== -1 ? count : "more than ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        return "".concat(value, " Estrela").concat(value !== 1 ? 's' : '');
      },
      emptyLabelText: 'Vazio'
    },
    MuiAutocomplete: {
      clearText: 'Limpar',
      closeText: 'Fechar',
      loadingText: 'Carregando…',
      noOptionsText: 'Sem opções',
      openText: 'Abrir'
    },
    MuiAlert: {
      closeText: 'Fechar'
    },
    MuiPagination: {
      'aria-label': 'Navegar pela paginação',
      getItemAriaLabel: function getItemAriaLabel(type, page, selected) {
        if (type === 'page') {
          return "".concat(selected ? '' : 'Ir para a ', "p\xE1gina ").concat(page);
        }

        if (type === 'first') {
          return 'Ir para a primeira página';
        }

        if (type === 'last') {
          return 'Ir para a última página';
        }

        if (type === 'next') {
          return 'Ir para a próxima página';
        } // if (type === 'previous') {


        return 'Ir para a página anterior';
      }
    }
  }
};
export var ptPT = {
  props: {
    MuiBreadcrumbs: {
      expandText: 'Mostrar caminho'
    },
    MuiTablePagination: {
      getItemAriaLabel: function getItemAriaLabel(type) {
        if (type === 'first') {
          return 'Primeira página';
        }

        if (type === 'last') {
          return 'Última página';
        }

        if (type === 'next') {
          return 'Próxima página';
        } // if (type === 'previous') {


        return 'Página anterior';
      },
      labelRowsPerPage: 'Linhas por página:',
      labelDisplayedRows: function labelDisplayedRows(_ref23) {
        var from = _ref23.from,
            to = _ref23.to,
            count = _ref23.count;
        return "".concat(from, "-").concat(to, " de ").concat(count !== -1 ? count : "more than ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        return "".concat(value, " Estrela").concat(value !== 1 ? 's' : '');
      },
      emptyLabelText: 'Vazio'
    },
    MuiAutocomplete: {
      clearText: 'Limpar',
      closeText: 'Fechar',
      loadingText: 'A carregar…',
      noOptionsText: 'Sem opções',
      openText: 'Abrir'
    },
    MuiAlert: {
      closeText: 'Fechar'
    },
    MuiPagination: {
      'aria-label': 'Navegar por páginas',
      getItemAriaLabel: function getItemAriaLabel(type, page, selected) {
        if (type === 'page') {
          return "".concat(selected ? '' : 'Ir para a ', "p\xE1gina ").concat(page);
        }

        if (type === 'first') {
          return 'Primeira página';
        }

        if (type === 'last') {
          return 'Última página';
        }

        if (type === 'next') {
          return 'Próxima página';
        } // if (type === 'previous') {


        return 'Página anterior';
      }
    }
  }
};
export var roRO = {
  props: {
    MuiBreadcrumbs: {
      expandText: 'Arată calea'
    },
    MuiTablePagination: {
      getItemAriaLabel: function getItemAriaLabel(type) {
        if (type === 'first') {
          return 'Mergi la prima pagină';
        }

        if (type === 'last') {
          return 'Mergi la ultima pagină';
        }

        if (type === 'next') {
          return 'Mergi la pagina următoare';
        } // if (type === 'previous') {


        return 'Mergi la pagina precedentă';
      },
      labelRowsPerPage: 'Rânduri pe pagină:',
      labelDisplayedRows: function labelDisplayedRows(_ref24) {
        var from = _ref24.from,
            to = _ref24.to,
            count = _ref24.count;
        return "".concat(from, "-").concat(to, " din ").concat(count !== -1 ? count : "more than ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        return "".concat(value, " St").concat(value !== 1 ? 'ele' : 'ea');
      },
      emptyLabelText: 'Gol'
    },
    MuiAutocomplete: {
      clearText: 'Șterge',
      closeText: 'Închide',
      loadingText: 'Se încarcă…',
      noOptionsText: 'Nicio opțiune',
      openText: 'Deschide'
    },
    MuiAlert: {
      closeText: 'Închide'
    },
    MuiPagination: {
      'aria-label': 'Navigare prin paginare',
      getItemAriaLabel: function getItemAriaLabel(type, page, selected) {
        if (type === 'page') {
          return "".concat(selected ? '' : 'Mergi la ', "pagina ").concat(page);
        }

        if (type === 'first') {
          return 'Mergi la prima pagină';
        }

        if (type === 'last') {
          return 'Mergi la ultima pagină';
        }

        if (type === 'next') {
          return 'Mergi la pagina următoare';
        } // if (type === 'previous') {


        return 'Mergi la pagina precedentă';
      }
    }
  }
};
export var ruRU = {
  props: {
    MuiBreadcrumbs: {
      expandText: 'Показать полный путь'
    },
    MuiTablePagination: {
      getItemAriaLabel: function getItemAriaLabel(type) {
        if (type === 'first') {
          return 'Перейти на первую страницу';
        }

        if (type === 'last') {
          return 'Перейти на последнюю страницу';
        }

        if (type === 'next') {
          return 'Перейти на следующую страницу';
        } // if (type === 'previous') {


        return 'Перейти на предыдущую страницу';
      },
      labelRowsPerPage: 'Строк на странице:',
      labelDisplayedRows: function labelDisplayedRows(_ref25) {
        var from = _ref25.from,
            to = _ref25.to,
            count = _ref25.count;
        return "".concat(from, "-").concat(to, " \u0438\u0437 ").concat(count !== -1 ? count : "\u0431\u043E\u043B\u0435\u0435 \u0447\u0435\u043C ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        var pluralForm = 'Звёзд';
        var lastDigit = value % 10;

        if (lastDigit > 1 && lastDigit < 5) {
          pluralForm = 'Звезды';
        } else if (lastDigit === 1) {
          pluralForm = 'Звезда';
        }

        return "".concat(value, " ").concat(pluralForm);
      },
      emptyLabelText: 'Рейтинг отсутствует'
    },
    MuiAutocomplete: {
      clearText: 'Очистить',
      closeText: 'Закрыть',
      loadingText: 'Загрузка…',
      noOptionsText: 'Нет доступных вариантов',
      openText: 'Открыть'
    },
    MuiAlert: {
      closeText: 'Закрыть'
    },
    MuiPagination: {
      'aria-label': 'Навигация по страницам',
      getItemAriaLabel: function getItemAriaLabel(type, page, selected) {
        if (type === 'page') {
          if (selected) return "".concat(page, " \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0430");
          return "\u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u043D\u0430 ".concat(page, " \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443");
        }

        if (type === 'first') {
          return 'Перейти на первую страницу';
        }

        if (type === 'last') {
          return 'Перейти на последнюю страницу';
        }

        if (type === 'next') {
          return 'Перейти на следующую страницу';
        } // if (type === 'previous') {


        return 'Перейти на предыдущую страницу';
      }
    }
  }
};
export var skSK = {
  props: {
    MuiBreadcrumbs: {
      expandText: 'Ukázať cestu '
    },
    MuiTablePagination: {
      getItemAriaLabel: function getItemAriaLabel(type) {
        if (type === 'first') {
          return 'Ísť na prvú stránku';
        }

        if (type === 'last') {
          return 'Ísť na poslednú stránku';
        }

        if (type === 'next') {
          return 'Ísť na ďaľšiu stránku';
        } // if (type === 'previous') {


        return 'Ísť na predchádzajúcu stránku';
      },
      labelRowsPerPage: 'Riadkov na stránke:',
      labelDisplayedRows: function labelDisplayedRows(_ref26) {
        var from = _ref26.from,
            to = _ref26.to,
            count = _ref26.count;
        return "".concat(from, "-").concat(to, " z ").concat(count !== -1 ? count : "viac ako ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        if (value === 1) {
          return "".concat(value, " hviezdi\u010Dka");
        }

        if (value >= 2 && value <= 4) {
          return "".concat(value, " hviezdi\u010Dky");
        }

        return "".concat(value, " hviezdi\u010Diek");
      },
      emptyLabelText: 'Prázdne'
    },
    MuiAutocomplete: {
      clearText: 'Vymazať',
      closeText: 'Zavrieť',
      loadingText: 'Načítanie…',
      noOptionsText: 'Žiadne možnosti',
      openText: 'Otvoriť'
    },
    MuiAlert: {
      closeText: 'Zavrieť'
    },
    MuiPagination: {
      'aria-label': 'Navigácia stránkovanim',
      getItemAriaLabel: function getItemAriaLabel(type, page, selected) {
        if (type === 'page') {
          return "".concat(selected ? '' : 'Ísť na ', "str\xE1nku ").concat(page);
        }

        if (type === 'first') {
          return 'Ísť na prvú stránku';
        }

        if (type === 'last') {
          return 'Ísť na poslednú stránku';
        }

        if (type === 'next') {
          return 'Ísť na ďaľšiu stránku';
        } // if (type === 'previous') {


        return 'Ísť na predchádzajúcu stránku';
      }
    }
  }
};
export var svSE = {
  props: {
    MuiBreadcrumbs: {
      expandText: 'Visa sökväg'
    },
    MuiTablePagination: {
      getItemAriaLabel: function getItemAriaLabel(type) {
        if (type === 'first') {
          return 'Gå till första sidan';
        }

        if (type === 'last') {
          return 'Gå till sista sidan';
        }

        if (type === 'next') {
          return 'Gå till nästa sida';
        } // if (type === 'previous') {


        return 'Gå till föregående sida';
      },
      labelRowsPerPage: 'Rader per sida:',
      labelDisplayedRows: function labelDisplayedRows(_ref27) {
        var from = _ref27.from,
            to = _ref27.to,
            count = _ref27.count;
        return "".concat(from, "-").concat(to, " av ").concat(count !== -1 ? count : "fler \xE4n ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        return "".concat(value, " ").concat(value !== 1 ? 'Stjärnor' : 'Stjärna');
      },
      emptyLabelText: 'Tom'
    },
    MuiAutocomplete: {
      clearText: 'Rensa',
      closeText: 'Stäng',
      loadingText: 'Laddar…',
      noOptionsText: 'Inga alternativ',
      openText: 'Öppna'
    },
    MuiAlert: {
      closeText: 'Stäng'
    },
    MuiPagination: {
      'aria-label': 'Sidnavigering',
      getItemAriaLabel: function getItemAriaLabel(type, page, selected) {
        if (type === 'page') {
          return "".concat(selected ? '' : 'Gå till ', "sida ").concat(page);
        }

        if (type === 'first') {
          return 'Gå till första sidan';
        }

        if (type === 'last') {
          return 'Gå till sista sidan';
        }

        if (type === 'next') {
          return 'Gå till nästa sida';
        } // if (type === 'previous') {


        return 'Gå till föregående sida';
      }
    }
  }
};
export var trTR = {
  props: {
    MuiBreadcrumbs: {
      expandText: 'Yolu göster'
    },
    MuiTablePagination: {
      getItemAriaLabel: function getItemAriaLabel(type) {
        if (type === 'first') {
          return 'İlk sayfaya git';
        }

        if (type === 'last') {
          return 'Son sayfaya git';
        }

        if (type === 'next') {
          return 'Sonraki sayfaya git';
        } // if (type === 'previous') {


        return 'Önceki sayfaya git';
      },
      labelRowsPerPage: 'Sayfa başına satır:',
      labelDisplayedRows: function labelDisplayedRows(_ref28) {
        var from = _ref28.from,
            to = _ref28.to,
            count = _ref28.count;
        return "".concat(from, "-").concat(to, " tanesinden ").concat(count !== -1 ? count : "more than ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        return "".concat(value, " Y\u0131ld\u0131z");
      },
      emptyLabelText: 'Boş'
    },
    MuiAutocomplete: {
      clearText: 'Temizle',
      closeText: 'Kapat',
      loadingText: 'Yükleniyor…',
      noOptionsText: 'Seçenek yok',
      openText: 'Aç'
    },
    MuiAlert: {
      closeText: 'Kapat'
    },
    MuiPagination: {
      'aria-label': 'Sayfa navigasyonu',
      getItemAriaLabel: function getItemAriaLabel(type, page, selected) {
        if (type === 'page') {
          return "".concat(page, ". ").concat(selected ? 'sayfa' : 'sayfaya git');
        }

        if (type === 'first') {
          return 'İlk sayfaya git';
        }

        if (type === 'last') {
          return 'Son sayfaya git';
        }

        if (type === 'next') {
          return 'Sonraki sayfaya git';
        } // if (type === 'previous') {


        return 'Önceki sayfaya git';
      }
    }
  }
};
export var ukUA = {
  props: {
    MuiBreadcrumbs: {
      expandText: 'Показати шлях сторінок'
    },
    MuiTablePagination: {
      getItemAriaLabel: function getItemAriaLabel(type) {
        if (type === 'first') {
          return 'Перейти на першу сторінку';
        }

        if (type === 'last') {
          return 'Перейти на останню сторінку';
        }

        if (type === 'next') {
          return 'Перейти на наступну сторінку';
        } // if (type === 'previous') {


        return 'Перейти на попередню сторінку';
      },
      labelRowsPerPage: 'Рядків на сторінці:',
      labelDisplayedRows: function labelDisplayedRows(_ref29) {
        var from = _ref29.from,
            to = _ref29.to,
            count = _ref29.count;
        return "".concat(from, "-").concat(to, " \u0437 ").concat(count !== -1 ? count : "\u043F\u043E\u043D\u0430\u0434 ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        var pluralForm = 'Зірок';
        var lastDigit = value % 10;

        if (lastDigit > 1 && lastDigit < 5) {
          pluralForm = 'Зірки';
        } else if (lastDigit === 1) {
          pluralForm = 'Зірка';
        }

        return "".concat(value, " ").concat(pluralForm);
      },
      emptyLabelText: 'Рейтинг відсутній'
    },
    MuiAutocomplete: {
      clearText: 'Очистити',
      closeText: 'Згорнути',
      loadingText: 'Завантаження…',
      noOptionsText: 'Немає варіантів',
      openText: 'Розгорнути'
    },
    MuiAlert: {
      closeText: 'Згорнути'
    },
    MuiPagination: {
      'aria-label': 'Навігація сторінками',
      getItemAriaLabel: function getItemAriaLabel(type, page, selected) {
        if (type === 'page') {
          return "".concat(selected ? '' : 'Перейти на ', "\u0441\u0442\u043E\u0440\u0456\u043D\u043A\u0443 ").concat(page);
        }

        if (type === 'first') {
          return 'Перейти на першу сторінку';
        }

        if (type === 'last') {
          return 'Перейти на останню сторінку';
        }

        if (type === 'next') {
          return 'Перейти на наступну сторінку';
        } // if (type === 'previous') {


        return 'Перейти на попередню сторінку';
      }
    }
  }
};
export var viVN = {
  props: {
    // MuiBreadcrumbs: {
    //   expandText: 'Show path',
    // },
    MuiTablePagination: {
      // getItemAriaLabel: (type) => {
      //   if (type === 'first') {
      //     return 'Go to first page';
      //   }
      //   if (type === 'last') {
      //     return 'Go to last page';
      //   }
      //   if (type === 'next') {
      //     return 'Go to next page';
      //   }
      //   // if (type === 'previous') {
      //   return 'Go to previous page';
      // },
      labelRowsPerPage: 'Số hàng mỗi trang:',
      labelDisplayedRows: function labelDisplayedRows(_ref30) {
        var from = _ref30.from,
            to = _ref30.to,
            count = _ref30.count;
        return "".concat(from, "-").concat(to, " trong ").concat(count !== -1 ? count : "nhi\u1EC1u h\u01A1n ".concat(to));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        return "".concat(value, " sao");
      },
      emptyLabelText: 'Trống'
    },
    MuiAutocomplete: {
      clearText: 'Xóa',
      closeText: 'Đóng',
      loadingText: 'Đang tải…',
      noOptionsText: 'Không có lựa chọn',
      openText: 'Mở'
    },
    MuiAlert: {
      closeText: 'Đóng'
    } // MuiPagination: {
    //   'aria-label': 'Pagination navigation',
    //   getItemAriaLabel: (type, page, selected) => {
    //     if (type === 'page') {
    //       return `${selected ? '' : 'Go to '}page ${page}`;
    //     }
    //     if (type === 'first') {
    //       return 'Go to first page';
    //     }
    //     if (type === 'last') {
    //       return 'Go to last page';
    //     }
    //     if (type === 'next') {
    //       return 'Go to next page';
    //     }
    //     // if (type === 'previous') {
    //     return 'Go to previous page';
    //   },
    // },

  }
};
export var zhCN = {
  props: {
    MuiBreadcrumbs: {
      expandText: '展开'
    },
    MuiTablePagination: {
      getItemAriaLabel: function getItemAriaLabel(type) {
        if (type === 'first') {
          return '第一页';
        }

        if (type === 'last') {
          return '最后一页';
        }

        if (type === 'next') {
          return '下一页';
        }

        return '上一页';
      },
      labelRowsPerPage: '每页行数:',
      labelDisplayedRows: function labelDisplayedRows(_ref31) {
        var from = _ref31.from,
            to = _ref31.to,
            count = _ref31.count;
        return "\u7B2C ".concat(from, " \u6761\u5230\u7B2C ").concat(to, " \u6761\uFF0C").concat(count !== -1 ? "\u5171 ".concat(count, " \u6761") : "\u81F3\u5C11 ".concat(to, " \u6761"));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        return "".concat(value, " \u9897\u661F");
      },
      emptyLabelText: '无标签'
    },
    MuiAutocomplete: {
      clearText: '清空',
      closeText: '关闭',
      loadingText: '加载中……',
      noOptionsText: '没有可用选项',
      openText: '打开'
    },
    MuiAlert: {
      closeText: '关闭'
    }
  }
};
export var zhTW = {
  props: {
    MuiBreadcrumbs: {
      expandText: '展開'
    },
    MuiTablePagination: {
      getItemAriaLabel: function getItemAriaLabel(type) {
        if (type === 'first') {
          return '第一頁';
        }

        if (type === 'last') {
          return '最後一頁';
        }

        if (type === 'next') {
          return '下一頁';
        }

        return '上一頁';
      },
      labelRowsPerPage: '每行行數:',
      labelDisplayedRows: function labelDisplayedRows(_ref32) {
        var from = _ref32.from,
            to = _ref32.to,
            count = _ref32.count;
        return "\u7B2C ".concat(from, " \u689D\u5230\u7B2C ").concat(to, " \u689D\uFF0C").concat(count !== -1 ? "\u5171 ".concat(count, " \u689D") : "\u81F3\u5C11 ".concat(to, " \u689D"));
      }
    },
    MuiRating: {
      getLabelText: function getLabelText(value) {
        return "".concat(value, " \u9846\u661F");
      },
      emptyLabelText: '無標簽'
    },
    MuiAutocomplete: {
      clearText: '清空',
      closeText: '關閉',
      loadingText: '加載中……',
      noOptionsText: '没有可用選項',
      openText: '打开'
    },
    MuiAlert: {
      closeText: '關閉'
    }
  }
};