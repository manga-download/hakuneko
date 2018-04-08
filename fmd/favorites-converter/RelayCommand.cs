using System;
using System.Windows.Input;

namespace fmd2hakuneko
{
    class RelayCommand : ICommand
    {
        public event EventHandler CanExecuteChanged;

        private Action<object> _execute;
        private Predicate<object> _canExecute;

        public RelayCommand(Action<object> execute, Predicate<object> canExecute = null)
        {
            _execute = execute;
            _canExecute = canExecute;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="param"></param>
        public void Execute(object param)
        {
            _execute?.Invoke(param);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="param"></param>
        /// <returns></returns>
        public bool CanExecute(object param)
        {
            return (_canExecute != null ? _canExecute.Invoke(param) : true);
        }
    }
}
