using Microsoft.Win32;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data.SQLite;
using System.IO;
using System.Windows;
using System.Windows.Input;

namespace fmd2hakuneko
{
    /// <summary>
    /// 
    /// </summary>
    class MainWindowViewModel : ViewModelBase
    {
        private string _importFileName;
        private bool _exportUnsupported;
        private List<FavoriteViewModel> _favorites;

        /// <summary>
        /// 
        /// </summary>
        public ICommand ImportFmd { get; private set; }

        /// <summary>
        /// 
        /// </summary>
        public ICommand ExportHakuNeko { get; private set; }

        /// <summary>
        /// 
        /// </summary>
        public string ImportFileName
        {
            get
            {
                return _importFileName;
            }
            set
            {
                if (_importFileName == value)
                {
                    return;
                }
                _importFileName = value;
                OnPropertyChanged(nameof(ImportFileName));
            }
        }

        /// <summary>
        /// 
        /// </summary>
        public List<FavoriteViewModel> Favorites
        {
            get
            {
                return _favorites;
            }
            set
            {
                if (_favorites == value)
                {
                    return;
                }
                _favorites = value;
                OnPropertyChanged(nameof(Favorites));
            }
        }

        /// <summary>
        /// 
        /// </summary>
        public bool ExportUnsupported
        {
            get
            {
                return _exportUnsupported;
            }
            set
            {
                if (_exportUnsupported == value)
                {
                    return;
                }
                _exportUnsupported = value;
                OnPropertyChanged(nameof(ExportUnsupported));
            }
        }

        /// <summary>
        /// 
        /// </summary>
        public MainWindowViewModel()
        {
            Favorites = new List<FavoriteViewModel>();
            InitializeCommands();
        }

        /// <summary>
        /// 
        /// </summary>
        private void InitializeCommands()
        {
            ImportFmd = new RelayCommand(ImportFmd_Execute);
            ExportHakuNeko = new RelayCommand(ExportHakuNeko_Execute, ExportHakuNeko_CanExecute);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="param"></param>
        /// <returns></returns>
        private bool ImportFmd_CanExecute(object param)
        {
            return true;
        }

        /// <summary>
        /// Import bookmarks from FMD.
        /// Due to the simplicity of this programm, this will be done directly in the ViewModel instead of an extra model layer.
        /// </summary>
        /// <param name="param"></param>
        private void ImportFmd_Execute(object param)
        {
            if (!ImportFmd_CanExecute(param))
            {
                return;
            }
            try
            {
                OpenFileDialog openFileDialog = new OpenFileDialog();
                openFileDialog.Filter = "FMD Favorites|favorites.db";
                if (openFileDialog.ShowDialog() != true)
                {
                    throw new Exception("No file selected!");
                }
                ImportFileName = openFileDialog.FileName;// File.ReadAllText(openFileDialog.FileName);
                if (!File.Exists(ImportFileName))
                {
                    throw new FileNotFoundException("File does not exist!", ImportFileName);
                }
                var dbConnection = new SQLiteConnection($"Data Source={ImportFileName};Version=3;");
                dbConnection.Open();
                SQLiteCommand command = new SQLiteCommand("SELECT * FROM favorites ORDER BY `website`, `title`", dbConnection);
                SQLiteDataReader reader = command.ExecuteReader();
                List<FavoriteViewModel> favorites = new List<FavoriteViewModel>();
                while (reader.Read())
                {
                    favorites.Add(new FavoriteViewModel(reader));
                }
                Favorites = favorites;
            }
            catch (Exception error)
            {
                ImportFileName = string.Empty;
                MessageBox.Show(error.Message, "Import Error");
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="param"></param>
        /// <returns></returns>
        private bool ExportHakuNeko_CanExecute(object param)
        {
            return true;
        }

        /// <summary>
        /// Export bookmarks to HakuNeko.
        /// Due to the simplicity of this programm, this will be done directly in the ViewModel instead of an extra model layer.
        /// </summary>
        /// <param name="param"></param>
        private void ExportHakuNeko_Execute(object param)
        {
            if (!ExportHakuNeko_CanExecute(param))
            {
                return;
            }
            try
            {
                SaveFileDialog saveFileDialog = new SaveFileDialog();
                saveFileDialog.FileName = "hakuneko-export.json";
                saveFileDialog.Filter = "HakuNeko JSON|*.json";
                if (saveFileDialog.ShowDialog() == true)
                {
                    JArray bookmarks = new JArray();

                    foreach (var favorite in Favorites)
                    {
                        if (favorite.IsSupported || ExportUnsupported)
                        {
                            bookmarks.Add(new JObject(
                                new JProperty("key",
                                    new JObject(
                                        new JProperty("connector", favorite.WebsiteUri),
                                        new JProperty("manga", favorite.MangaUri)
                                    )
                                ),
                                new JProperty("title",
                                    new JObject(
                                        new JProperty("connector", favorite.WebsiteName),
                                        new JProperty("manga", favorite.MangaName)
                                    )
                                )
                            ));
                        }
                    }

                    JObject export = new JObject(
                        new JProperty("bookmarks", bookmarks)
                    );

                    File.WriteAllText(saveFileDialog.FileName, export.ToString(), System.Text.Encoding.UTF8);
                }
            }
            catch (Exception error)
            {
                MessageBox.Show(error.Message, "Export Error");
            }
        }
    }
}