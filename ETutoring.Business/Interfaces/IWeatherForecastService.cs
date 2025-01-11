using ETutoring.DataAccess.Entities;

namespace ETutoring.Business.Interfaces;

public interface IWeatherForecastService
{
    IEnumerable<WeatherForecast> GetWeatherForecasts();
}