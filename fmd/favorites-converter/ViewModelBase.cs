using System.ComponentModel;

namespace fmd2hakuneko
{
    class ViewModelBase : INotifyPropertyChanged
    {
        /// <summary>
        /// 
        /// </summary>
        public event PropertyChangedEventHandler PropertyChanged;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="property">Name of the property (member) that has been changed and needs to be updated in the UI</param>
        protected virtual void OnPropertyChanged(string property = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(property));
        }
    }
}
