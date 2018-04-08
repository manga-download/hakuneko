using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.SQLite;
using System.Net;
using System.Windows;

namespace fmd2hakuneko
{
    /// <summary>
    /// 
    /// </summary>
    class FavoriteViewModel : ViewModelBase
    {
        const string MAP_URI = @"http://master.dl.sourceforge.net/project/hakuneko/tools/map.json";
        private static Dictionary<string, string> _map;

        private string _websiteName;
        private string _websiteUri;
        private string _mangaName;
        private string _mangaUri;
        private string _aliasName;
        private bool _isSupported;

        /// <summary>
        /// 
        /// </summary>
        public string WebsiteName
        {
            get
            {
                return _websiteName;
            }
            set
            {
                if (_websiteName == value)
                {
                    return;
                }
                _websiteName = value;
                OnPropertyChanged(nameof(WebsiteName));
            }
        }

        /// <summary>
        /// 
        /// </summary>
        public string WebsiteUri
        {
            get
            {
                return _websiteUri;
            }
            set
            {
                if (_websiteUri == value)
                {
                    return;
                }
                _websiteUri = value;
                OnPropertyChanged(nameof(WebsiteUri));
            }
        }

        /// <summary>
        /// 
        /// </summary>
        public string MangaName
        {
            get
            {
                return _mangaName;
            }
            set
            {
                if (_mangaName == value)
                {
                    return;
                }
                _mangaName = value;
                OnPropertyChanged(nameof(MangaName));
            }
        }

        /// <summary>
        /// 
        /// </summary>
        public string MangaUri
        {
            get
            {
                return _mangaUri;
            }
            set
            {
                if (_mangaUri == value)
                {
                    return;
                }
                _mangaUri = value;
                OnPropertyChanged(nameof(MangaUri));
            }
        }

        /// <summary>
        /// 
        /// </summary>
        public string AliasName
        {
            get
            {
                return _aliasName;
            }
            set
            {
                if (_aliasName == value)
                {
                    return;
                }
                _aliasName = value;
                OnPropertyChanged(nameof(AliasName));
            }
        }

        /// <summary>
        /// 
        /// </summary>
        public bool IsSupported
        {
            get
            {
                return _isSupported;
            }
            set
            {
                if (_isSupported == value)
                {
                    return;
                }
                _isSupported = value;
                OnPropertyChanged(nameof(IsSupported));
            }
        }

        /// <summary>
        /// 
        /// </summary>
        static FavoriteViewModel()
        {
            try
            {
                WebClient http = new WebClient();
                string json = http.DownloadString(MAP_URI);
                _map = JsonConvert.DeserializeObject<Dictionary<string, string>>(json);
            }
            catch(Exception error)
            {
                MessageBox.Show(error.Message, nameof(CanSupport) + "-Check Error");
                _map = new Dictionary<string, string>();
            }
        }

        /// <summary>
        /// Create a favorite view model of the SQL current row from FMD's favorite database table.
        /// </summary>
        public FavoriteViewModel(SQLiteDataReader dataRow)
        {
            WebsiteName = (string)dataRow["website"];
            IsSupported = CanSupport((string)dataRow["websitelink"]);
            WebsiteUri = ConvertWebsiteUri((string)dataRow["websitelink"]);
            MangaName = (string)dataRow["title"];
            MangaUri = ConvertMangaUri(WebsiteUri, (string)dataRow["link"]);
        }

        /// <summary>
        /// Determine if the given website is supported in HakuNeko or not.
        /// </summary>
        private bool CanSupport(string websitelink)
        {
            string key = websitelink.Split('/')[0];
            return _map.ContainsKey(key);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="websitelink"></param>
        /// <returns></returns>
        private string ConvertWebsiteUri(string websitelink)
        {
            string key = websitelink.Split('/')[0];
            if (_map.ContainsKey(key))
            {
                return _map[key];
            }
            else
            {
                return key;
            }
        }

        /// <summary>
        /// HakuNeko uses different URIs for some connectors then FMD.
        /// This methods tries to convert the known URIs from FMD to HakuNeko.
        /// </summary>
        /// <returns></returns>
        private string ConvertMangaUri(string website, string mangalink)
        {
            if(website.StartsWith("mangarock"))
            {
                return Array.FindLast(mangalink.Split('/'), s => !string.IsNullOrEmpty(s));
            }
            if(website.StartsWith("tumangaonline"))
            {
                return Array.FindLast(mangalink.Split('/'), s => int.TryParse(s, out int n));
            }
            return mangalink;
        }
    }
}
