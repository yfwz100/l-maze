using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Navigation;
using Microsoft.Phone.Controls;
using Microsoft.Phone.Shell;
using System.IO;
using System.IO.IsolatedStorage;
using Telerik.Windows.Controls;
using System.ComponentModel;
using System.Threading;
using System.Globalization;
using Microsoft.Xna.Framework.Media;
using System.Windows.Media.Imaging;

namespace LMaze
{
    public partial class MainPage : PhoneApplicationPage
    {
        // 主页的 Url
        private string MainUri = "/Html/index.html";
        //处理加载效果
        private int currentAnimation = 8;
        private BackgroundWorker backroungWorker;
        private int score = 0;

        // 构造函数
        public MainPage()
        {
            InitializeComponent();
        }

        private void Browser_Loaded(object sender, RoutedEventArgs e)
        {
            Browser.Navigate(new Uri(MainUri, UriKind.Relative));
            Browser.IsScriptEnabled = true;
        }

        // 保存当前游戏画面
        private void SaveGameMap(object sender, EventArgs e)
        {
            string data = Browser.InvokeScript("getCanvasURL").ToString();
            data = data.Remove(0, 22);
            this.saveCanvasToIsolatedStorage("image", data);
            this.SaveToPhotoLibrary();
            MessageBox.Show("已成功保存到图片文件夹下。");
           
        }
        //save
        private void saveCanvasToIsolatedStorage(string fileName,string base64)
        {
            using (IsolatedStorageFile file = IsolatedStorageFile.GetUserStoreForApplication())
            {
                if (file.FileExists(fileName))
                {
                    file.DeleteFile(fileName);
                }
                IsolatedStorageFileStream stream = file.CreateFile(fileName);
                WriteableBitmap bitmap = GetImageFromBase64(base64);

                Extensions.SaveJpeg(bitmap, stream, bitmap.PixelWidth, bitmap.PixelHeight, 0, 100);
                stream.Close();
            }
        }
        private void SaveToPhotoLibrary()
        {
            using (IsolatedStorageFile file = IsolatedStorageFile.GetUserStoreForApplication())
            {
                using (IsolatedStorageFileStream stream = file.OpenFile("image", FileMode.Open, FileAccess.Read))
                {
                    new MediaLibrary().SavePicture("Picture.jpg", stream);
                    stream.Close();
                }
            }
        }
        public WriteableBitmap GetImageFromBase64(string base64string)
        {
            byte[] b = Convert.FromBase64String(base64string);
            MemoryStream ms = new MemoryStream(b);
            BitmapImage bi = new BitmapImage(); 
            bi.SetSource(ms);
            WriteableBitmap wb = new WriteableBitmap(bi as BitmapSource);
            return wb;
        }

        // 旋转当前方块
        private void Rotate(object sender, EventArgs e)
        {
            Browser.InvokeScript("rotate");
        }

        // 移到当前方块上
        private void CurrentTile(object sender, EventArgs e)
        {
            Browser.InvokeScript("center");
        }

        // 下一步
        private void Next(object sender, EventArgs e)
        {
            Browser.InvokeScript("next");
        }

        // 重新加载页面（重新开始游戏）
        private void Restart(object sender, EventArgs e)
        {
            set3AppBar();
            score = 0;
            Browser.Navigate(new Uri(MainUri, UriKind.Relative));
        }

        // 处理导航故障。
        private void Browser_NavigationFailed(object sender, System.Windows.Navigation.NavigationFailedEventArgs e)
        {
            MessageBox.Show("无法导航到此页面，请检查 Internet 连接");
        }


        //加载效果
        private void ShowPopup()
        {
            this.busyIndicator.AnimationStyle = (AnimationStyle)(this.currentAnimation);    //设置指示器动画实例
            this.busyIndicator.Content = "Loading...";     //定义动画旁边所显示的内容
            this.busyIndicator.IsRunning = true;    //控制是否显示动画
            StartLoadingData();//开始加载数据
        }

        private void StartLoadingData()
        {
            //使用BackgroundWorker在单独的线程上执行操作
            backroungWorker = new BackgroundWorker();
            //调用 RunWorkerAsync后台操作时引发此事件，即后台要处理的事情写在这个事件里面
            backroungWorker.DoWork += new DoWorkEventHandler(backroungWorker_DoWork);
            //当后台操作完成事件
            backroungWorker.RunWorkerCompleted += new RunWorkerCompletedEventHandler(backroungWorker_RunWorkerCompleted);
            //开始执行后台操作
            backroungWorker.RunWorkerAsync();
        }

        //后台操作完成
        void backroungWorker_RunWorkerCompleted(object sender, RunWorkerCompletedEventArgs e)
        {
            this.Dispatcher.BeginInvoke(() =>
            {
                this.busyIndicator.IsRunning = false;
                //关闭指示器  注意要使用Dispatcher.BeginInvoke开跟UI通讯
            }
            );
        }

        //后台操作处理
        void backroungWorker_DoWork(object sender, DoWorkEventArgs e)
        {
            // 程序初始化处理   这里只是模拟了一下            
            Thread.Sleep(300);
        }

        private void PhoneApplicationPage_Loaded_1(object sender, RoutedEventArgs e)
        {
            ShowPopup();
        }

        private void handleGameMessage(object sender, NotifyEventArgs e)
        {
            
            ApplicationBar.Opacity = 1;
            string stype = e.Value;
            if (stype == "over")
            {
                var ib1 = new ApplicationBarIconButton(new Uri("/Assets/AppBar/Repeat.png", UriKind.Relative)) { Text = "重新开始" };
                ib1.Click += new EventHandler(Restart);

                var ib2 = new ApplicationBarIconButton(new Uri("/Assets/AppBar/Savepictures.png", UriKind.Relative)) { Text = "保存地图" };
                ib2.Click += new EventHandler(SaveGameMap);

                this.ApplicationBar.Buttons.Clear();
                this.ApplicationBar.Buttons.Add(ib2);
                this.ApplicationBar.Buttons.Add(ib1);

                if (score < 50)
                {
                    MessageBox.Show("游戏结束了 T.T ");
                }
                else if (score < 90)
                {
                    MessageBox.Show("游戏结束了 -.- ");
                }
                else if (score < 100)
                {
                    MessageBox.Show("你是火星来的吗 0.0 ");
                }
                else
                {
                    MessageBox.Show("土豪，我们做朋友吧~");
                }
            }
            else if (stype == "step")
            {
                score++;
                ScoreTextBlock.Text = score.ToString(); 
            }
        }

        private void ApplicationBar_StateChanged(object sender, ApplicationBarStateChangedEventArgs e)
        {
            
        }

        private void set3AppBar()
        {
            var ib1 = new ApplicationBarIconButton(new Uri("/Assets/AppBar/appbar.rotate.rest.png", UriKind.Relative)) { Text = "旋转" };
            ib1.Click += new EventHandler(Rotate);

            var ib2 = new ApplicationBarIconButton(new Uri("/Assets/AppBar/appbar.find.rest.png", UriKind.Relative)) { Text = "定位焦点" };
            ib2.Click += new EventHandler(CurrentTile);

            var ib3 = new ApplicationBarIconButton(new Uri("/Assets/AppBar/appbar.next.rest.png", UriKind.Relative)) { Text = "下一步" };
            ib3.Click += new EventHandler(Next);
            this.ApplicationBar.Buttons.Clear();
            this.ApplicationBar.Buttons.Add(ib1);
            this.ApplicationBar.Buttons.Add(ib2);
            this.ApplicationBar.Buttons.Add(ib3);
        }
    }
}